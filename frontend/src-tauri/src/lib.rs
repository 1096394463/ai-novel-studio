#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use tauri::Manager;

struct BackendProcess(Mutex<Option<Child>>);
struct BackendStatus(Mutex<String>);
struct StartupLog(Mutex<Vec<String>>);

fn log(log_state: &Mutex<Vec<String>>, msg: &str) {
    println!("{}", msg);
    log_state.lock().unwrap().push(msg.to_string());
}

/// Strip Windows \\?\ prefix from paths (cmd.exe and many APIs don't understand it)
fn strip_unc_prefix(path: &std::path::Path) -> String {
    let s = path.to_string_lossy().to_string();
    if s.starts_with(r"\\?\") {
        s[4..].to_string()
    } else {
        s
    }
}

#[tauri::command]
fn get_backend_status(status: tauri::State<BackendStatus>) -> String {
    status.0.lock().unwrap().clone()
}

#[tauri::command]
fn get_startup_log(log_state: tauri::State<StartupLog>) -> Vec<String> {
    log_state.0.lock().unwrap().clone()
}

pub fn run() {
    let app = tauri::Builder::default()
        .manage(BackendProcess(Mutex::new(None)))
        .manage(BackendStatus(Mutex::new("starting".to_string())))
        .manage(StartupLog(Mutex::new(Vec::new())))
        .invoke_handler(tauri::generate_handler![get_backend_status, get_startup_log])
        .setup(|app| {
            let resource_dir = app
                .path()
                .resource_dir()
                .expect("failed to get resource dir");

            let startup_log = app.state::<StartupLog>();
            let slog = &startup_log.0;

            let app_data_dir = app.path().app_data_dir().unwrap_or_else(|_| resource_dir.clone());
            std::fs::create_dir_all(&app_data_dir).ok();
            let data_dir_str = strip_unc_prefix(&app_data_dir);

            log(slog, &format!("Resource dir: {}", strip_unc_prefix(&resource_dir)));
            log(slog, &format!("App data dir: {}", data_dir_str));

            // List resource dir contents
            if let Ok(entries) = std::fs::read_dir(&resource_dir) {
                for entry in entries.flatten() {
                    log(slog, &format!("  - {}", entry.path().display()));
                }
            }

            // Check backend dir
            let backend_dir = resource_dir.join("backend");
            if let Ok(entries) = std::fs::read_dir(&backend_dir) {
                log(slog, "backend/ contents:");
                for entry in entries.flatten() {
                    log(slog, &format!("  - {}", entry.path().display()));
                }
            } else {
                log(slog, "backend/ directory does not exist!");
            }

            // Find JAR
            let jar_path = find_file(&resource_dir, "backend/novel-studio-backend.jar", "novel-studio-backend*.jar");

            if let Some(jar) = jar_path {
                let java_cmd = find_java(&resource_dir);
                let jar_str = strip_unc_prefix(&jar);
                let db_url = format!("jdbc:sqlite:{}/novel-studio.db", data_dir_str);
                let log_file = format!("{}/novel-studio.log", data_dir_str);

                log(slog, &format!("JAR: {}", jar_str));
                log(slog, &format!("Java: {}", java_cmd));
                log(slog, &format!("DB: {}", db_url));
                log(slog, &format!("Log: {}", log_file));

                // Check if java.exe exists
                if !std::path::Path::new(&java_cmd).exists() {
                    log(slog, &format!("❌ Java binary does NOT exist: {}", java_cmd));
                    if let Some(s) = app.try_state::<BackendStatus>() {
                        *s.0.lock().unwrap() = "java_not_found".to_string();
                    }
                    return Ok(());
                }
                log(slog, &format!("✅ Java binary exists: {}", java_cmd));

                // Build args
                let args = vec![
                    "-jar".to_string(),
                    jar_str.clone(),
                    "--server.port=18080".to_string(),
                    "--server.address=127.0.0.1".to_string(),
                    "--spring.profiles.active=desktop".to_string(),
                    format!("--spring.datasource.url={}", db_url),
                    format!("--logging.file.name={}", log_file),
                ];

                log(slog, &format!("CMD: {} {}", java_cmd, args.join(" ")));

                // Spawn Java directly (no cmd.exe wrapper)
                let mut cmd = Command::new(&java_cmd);
                cmd.args(&args)
                    .current_dir(&app_data_dir)
                    .stdin(Stdio::null())
                    .stdout(Stdio::null())
                    .stderr(Stdio::null());

                // On Windows, hide the console window
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::process::CommandExt;
                    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
                }

                let child = cmd.spawn();

                match child {
                    Ok(mut child) => {
                        let pid = child.id();
                        log(slog, &format!("✅ Java spawned, PID: {}", pid));

                        // Check if process is still alive after 2 seconds
                        std::thread::sleep(std::time::Duration::from_secs(2));
                        match child.try_wait() {
                            Ok(Some(status)) => {
                                log(slog, &format!("❌ Java exited immediately: {}", status));
                                log(slog, "Hint: Run the JAR manually to see error output");
                                if let Some(s) = app.try_state::<BackendStatus>() {
                                    *s.0.lock().unwrap() = format!("exited: {}", status);
                                }
                            }
                            Ok(None) => {
                                log(slog, "✅ Java process is running after 2s");
                                if let Some(s) = app.try_state::<BackendStatus>() {
                                    *s.0.lock().unwrap() = "running".to_string();
                                }
                                let process_state = app.state::<BackendProcess>();
                                *process_state.0.lock().unwrap() = Some(child);
                            }
                            Err(e) => {
                                log(slog, &format!("⚠️ try_wait error: {}", e));
                                let process_state = app.state::<BackendProcess>();
                                *process_state.0.lock().unwrap() = Some(child);
                            }
                        }
                    }
                    Err(e) => {
                        log(slog, &format!("❌ Failed to spawn Java: {}", e));
                        if let Some(s) = app.try_state::<BackendStatus>() {
                            *s.0.lock().unwrap() = format!("spawn_error: {}", e);
                        }
                    }
                }
            } else {
                log(slog, &format!("❌ JAR not found in {}", strip_unc_prefix(&resource_dir)));
                if let Some(s) = app.try_state::<BackendStatus>() {
                    *s.0.lock().unwrap() = "jar_not_found".to_string();
                }
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // Health check: poll /api/health until backend is ready
    {
        let app_handle = app.handle().clone();
        thread::spawn(move || {
            let client = reqwest::blocking::Client::new();
            let mut attempts = 0;
            let max_attempts = 90; // 3 minutes
            while attempts < max_attempts {
                std::thread::sleep(std::time::Duration::from_secs(2));
                attempts += 1;

                // Check if Java process is still alive
                if let Some(state) = app_handle.try_state::<BackendProcess>() {
                    let mut guard = state.0.lock().unwrap();
                    if let Some(ref mut child) = *guard {
                        match child.try_wait() {
                            Ok(Some(status)) => {
                                println!("[Health] Java process exited: {}", status);
                                // Read stderr log for error details
                                if let Some(s) = app_handle.try_state::<BackendStatus>() {
                                    *s.0.lock().unwrap() = format!("exited: {}", status);
                                }
                                if let Some(log_state) = app_handle.try_state::<StartupLog>() {
                                    let mut logs = log_state.0.lock().unwrap();
                                    logs.push(format!("❌ Java process exited: {}", status));
                                    // Try to read java-stderr.log
                                    let err_log = app_handle.path().app_data_dir()
                                        .unwrap_or_else(|_| std::path::PathBuf::from("."))
                                        .join("java-stderr.log");
                                    if let Ok(content) = std::fs::read_to_string(&err_log) {
                                        logs.push("--- stderr log ---".to_string());
                                        for line in content.lines().take(20) {
                                            logs.push(format!("  {}", line));
                                        }
                                    }
                                }
                                break;
                            }
                            Ok(None) => { /* still running */ }
                            Err(_) => break,
                        }
                    }
                }

                match client.get("http://localhost:18080/api/health").send() {
                    Ok(resp) if resp.status().is_success() => {
                        println!("[Health] Backend is ready!");
                        if let Some(s) = app_handle.try_state::<BackendStatus>() {
                            *s.0.lock().unwrap() = "ready".to_string();
                        }
                        break;
                    }
                    _ => {
                        if attempts % 5 == 0 {
                            println!("[Health] Waiting... attempt {}/{}", attempts, max_attempts);
                        }
                    }
                }
            }
            if attempts >= max_attempts {
                println!("[Health] Backend did not become ready within timeout");
                if let Some(s) = app_handle.try_state::<BackendStatus>() {
                    let current = s.0.lock().unwrap().clone();
                    if current == "running" {
                        *s.0.lock().unwrap() = "timeout".to_string();
                    }
                }
            }
        });
    }

    app.run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            if let Some(state) = app_handle.try_state::<BackendProcess>() {
                if let Some(child) = state.0.lock().unwrap().as_mut() {
                    let _ = child.kill();
                    println!("[Backend] Java backend terminated on exit");
                }
            }
        }
    });
}

fn find_java(resource_dir: &std::path::Path) -> String {
    #[cfg(target_os = "windows")]
    let jre_bin = resource_dir.join("backend").join("jre").join("bin").join("java.exe");
    #[cfg(not(target_os = "windows"))]
    let jre_bin = resource_dir.join("backend").join("jre").join("bin").join("java");

    if jre_bin.exists() {
        return strip_unc_prefix(&jre_bin);
    }

    "java".to_string()
}

fn find_file(resource_dir: &std::path::Path, exact: &str, _pattern: &str) -> Option<std::path::PathBuf> {
    let path = resource_dir.join(exact);
    if path.exists() {
        return Some(path);
    }

    let dev_paths = vec![
        std::path::PathBuf::from("../backend/target/novel-studio-backend-0.1.0.jar"),
        std::path::PathBuf::from("backend/target/novel-studio-backend-0.1.0.jar"),
        std::path::PathBuf::from("../backend/build/libs/novel-studio-backend.jar"),
    ];

    for dev_path in dev_paths {
        if dev_path.exists() {
            return Some(dev_path);
        }
    }

    None
}
