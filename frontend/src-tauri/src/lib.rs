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

/// Strip Windows \\?\ prefix from paths (cmd.exe doesn't understand it)
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
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

            log(slog, &format!("Resource dir: {}", resource_dir.display()));
            log(slog, &format!("App data dir: {}", app_data_dir.display()));

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
                let java_log = strip_unc_prefix(&app_data_dir.join("java-stdout.log"));
                let java_err_log = strip_unc_prefix(&app_data_dir.join("java-stderr.log"));
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

                // Log the full command
                let full_cmd = format!(
                    "\"{}\" -jar \"{}\" --server.port=18080 --server.address=127.0.0.1 --spring.profiles.active=desktop --spring.datasource.url={} --logging.file.name={}",
                    java_cmd, jar_str, db_url, log_file
                );
                log(slog, &format!("CMD: {}", full_cmd));

                // Write a launcher script to capture all output
                #[cfg(target_os = "windows")]
                {
                    let bat_path = app_data_dir.join("start-backend.bat");
                    let bat_path_str = strip_unc_prefix(&bat_path);
                    let bat_content = format!(
                        "@echo off\r\nchcp 65001 >nul\r\necho [BAT] Starting Java backend at %TIME% > \"{}\"\r\necho [BAT] Java: {} >> \"{}\"\r\necho [BAT] JAR: {} >> \"{}\"\r\necho [BAT] CWD: {} >> \"{}\"\r\n\"{}\" -jar \"{}\" --server.port=18080 --server.address=127.0.0.1 --spring.profiles.active=desktop --spring.datasource.url={} --logging.file.name={} >> \"{}\" 2>&1\r\necho [BAT] Java exited with code %ERRORLEVEL% at %TIME% >> \"{}\"\r\n",
                        java_err_log, java_cmd, java_err_log, jar_str, java_err_log, data_dir_str, java_err_log,
                        java_cmd, jar_str, db_url, log_file, java_err_log, java_err_log
                    );
                    std::fs::write(&bat_path, &bat_content).ok();
                    log(slog, &format!("Wrote launcher: {}", bat_path_str));

                    let mut child = Command::new("cmd")
                        .args(["/C", &bat_path_str])
                        .current_dir(&app_data_dir)
                        .stdin(Stdio::null())
                        .stdout(Stdio::null())
                        .stderr(Stdio::null())
                        .spawn();

                    match child {
                        Ok(mut child) => {
                            let pid = child.id();
                            log(slog, &format!("✅ Launcher spawned, PID: {}", pid));

                            // Wait a moment, then check
                            std::thread::sleep(std::time::Duration::from_secs(3));

                            match child.try_wait() {
                                Ok(Some(status)) => {
                                    log(slog, &format!("❌ Launcher exited immediately: {}", status));
                                    // Read error log
                                    if let Ok(content) = std::fs::read_to_string(&java_err_log) {
                                        for line in content.lines().take(30) {
                                            log(slog, &format!("  {}", line));
                                        }
                                    }
                                    if let Some(s) = app.try_state::<BackendStatus>() {
                                        *s.0.lock().unwrap() = format!("exited: {}", status);
                                    }
                                    return Ok(());
                                }
                                Ok(None) => {
                                    log(slog, "✅ Launcher still running after 3s");
                                }
                                Err(e) => {
                                    log(slog, &format!("try_wait error: {}", e));
                                }
                            }

                            if let Some(state) = app.try_state::<BackendProcess>() {
                                *state.0.lock().unwrap() = Some(child);
                            }
                        }
                        Err(e) => {
                            log(slog, &format!("❌ Failed to spawn launcher: {}", e));
                            if let Some(s) = app.try_state::<BackendStatus>() {
                                *s.0.lock().unwrap() = format!("spawn_error: {}", e);
                            }
                            return Ok(());
                        }
                    }
                }

                #[cfg(not(target_os = "windows"))]
                {
                    let sh_path = app_data_dir.join("start-backend.sh");
                    let sh_path_str = strip_unc_prefix(&sh_path);
                    let sh_content = format!(
                        "#!/bin/bash\necho \"[SH] Starting Java backend at $(date)\" > \"{}\"\n\"{}\" -jar \"{}\" --server.port=18080 --server.address=127.0.0.1 --spring.profiles.active=desktop --spring.datasource.url={} --logging.file.name={} >> \"{}\" 2>&1\necho \"[SH] Java exited with code $? at $(date)\" >> \"{}\"\n",
                        java_err_log, java_cmd, jar_str, db_url, log_file, java_err_log, java_err_log
                    );
                    std::fs::write(&sh_path, &sh_content).ok();

                    let mut child = Command::new("bash")
                        .arg(&sh_path_str)
                        .current_dir(&app_data_dir)
                        .stdin(Stdio::null())
                        .stdout(Stdio::null())
                        .stderr(Stdio::null())
                        .spawn();

                    match child {
                        Ok(mut child) => {
                            let pid = child.id();
                            log(slog, &format!("✅ Launcher spawned, PID: {}", pid));

                            std::thread::sleep(std::time::Duration::from_secs(3));

                            match child.try_wait() {
                                Ok(Some(status)) => {
                                    log(slog, &format!("❌ Launcher exited: {}", status));
                                    if let Ok(content) = std::fs::read_to_string(&java_err_log) {
                                        for line in content.lines().take(30) {
                                            log(slog, &format!("  {}", line));
                                        }
                                    }
                                    if let Some(s) = app.try_state::<BackendStatus>() {
                                        *s.0.lock().unwrap() = format!("exited: {}", status);
                                    }
                                    return Ok(());
                                }
                                Ok(None) => {
                                    log(slog, "✅ Launcher still running after 3s");
                                }
                                Err(e) => {
                                    log(slog, &format!("try_wait error: {}", e));
                                }
                            }

                            if let Some(state) = app.try_state::<BackendProcess>() {
                                *state.0.lock().unwrap() = Some(child);
                            }
                        }
                        Err(e) => {
                            log(slog, &format!("❌ Failed to spawn launcher: {}", e));
                            if let Some(s) = app.try_state::<BackendStatus>() {
                                *s.0.lock().unwrap() = format!("spawn_error: {}", e);
                            }
                            return Ok(());
                        }
                    }
                }

                // Health check with startup log
                let app_handle = app.handle().clone();
                let log_file_path = log_file.clone();
                let err_log_path = strip_unc_prefix(&app_data_dir.join("java-stderr.log"));
                thread::spawn(move || {
                    for i in 1..=60 {
                        thread::sleep(std::time::Duration::from_secs(1));

                        // Check if launcher process is still alive
                        if let Some(proc) = app_handle.try_state::<BackendProcess>() {
                            if let Some(child) = proc.0.lock().unwrap().as_mut() {
                                match child.try_wait() {
                                    Ok(Some(status)) => {
                                        eprintln!("[Backend] ❌ Launcher exited: {}", status);
                                        // Read error log
                                        if let Ok(content) = std::fs::read_to_string(&err_log_path) {
                                            eprintln!("[Backend] Java stderr:\n{}", content);
                                        }
                                        *app_handle.state::<BackendStatus>().0.lock().unwrap() = format!("exited: {}", status);
                                        return;
                                    }
                                    Ok(None) => {}
                                    Err(_) => {}
                                }
                            }
                        }

                        match std::net::TcpStream::connect("127.0.0.1:18080") {
                            Ok(_) => {
                                println!("[Backend] ✅ Backend ready (attempt {}/60)", i);
                                *app_handle.state::<BackendStatus>().0.lock().unwrap() = "ready".to_string();
                                return;
                            }
                            Err(_) => {
                                if i % 10 == 0 {
                                    println!("[Backend] ⏳ Not ready ({}/60)", i);
                                    // Check if java log file has content
                                    if let Ok(content) = std::fs::read_to_string(&log_file_path) {
                                        if !content.is_empty() {
                                            println!("[Backend] Java log has {} bytes", content.len());
                                        }
                                    }
                                }
                            }
                        }
                    }
                    eprintln!("[Backend] ❌ Backend did not start within 60s!");
                    *app_handle.state::<BackendStatus>().0.lock().unwrap() = "failed".to_string();
                });

            } else {
                log(slog, "❌ Backend JAR not found!");
                if let Some(status) = app.try_state::<BackendStatus>() {
                    *status.0.lock().unwrap() = "jar_not_found".to_string();
                }
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

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
    ];

    for p in dev_paths {
        if p.exists() {
            return Some(p);
        }
    }

    None
}
