#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use tauri::Manager;

struct BackendProcess(Mutex<Option<Child>>);
struct BackendStatus(Mutex<String>); // "starting" | "jar_not_found" | "ready" | "failed"
struct StartupLog(Mutex<Vec<String>>);

fn log(app: &tauri::AppHandle, msg: &str) {
    println!("{}", msg);
    if let Some(state) = app.try_state::<StartupLog>() {
        state.0.lock().unwrap().push(msg.to_string());
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

            // Determine app data directory for DB and logs
            let app_data_dir = app.path().app_data_dir().unwrap_or_else(|_| resource_dir.clone());
            std::fs::create_dir_all(&app_data_dir).ok();
            let data_dir_str = app_data_dir.to_string_lossy().to_string();

            println!("[Backend] Resource dir: {:?}", resource_dir);
            println!("[Backend] App data dir: {:?}", app_data_dir);

            // Log to startup log for frontend
            log(app, &format!("Resource dir: {:?}", resource_dir));
            log(app, &format!("App data dir: {:?}", app_data_dir));

            // List resource dir contents
            if let Ok(entries) = std::fs::read_dir(&resource_dir) {
                for entry in entries.flatten() {
                    log(app, &format!("  - {:?}", entry.path()));
                }
            }

            // Find JAR
            let jar_path = find_file(&resource_dir, "backend/novel-studio-backend.jar", "novel-studio-backend*.jar");

            if let Some(jar) = jar_path {
                // Find Java: prefer bundled JRE, fallback to system java
                let java_cmd = find_java(&resource_dir);
                let jar_str = jar.to_string_lossy().to_string();

                log(app, &format!("JAR found: {}", jar_str));
                log(app, &format!("Java command: {}", java_cmd));

                let mut child = Command::new(&java_cmd)
                    .args([
                        "-jar",
                        &jar_str,
                        "--server.port=18080",
                        "--server.address=127.0.0.1",
                        "--spring.profiles.active=desktop",
                        &format!("--spring.datasource.url=jdbc:sqlite:{}/novel-studio.db", data_dir_str),
                        &format!("--logging.file.name={}/novel-studio.log", data_dir_str),
                    ])
                    .current_dir(&app_data_dir)
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped())
                    .spawn();

                match child {
                    Ok(mut child) => {
                        // Capture stdout in a separate thread
                        if let Some(stdout) = child.stdout.take() {
                            thread::spawn(move || {
                                let reader = BufReader::new(stdout);
                                for line in reader.lines() {
                                    match line {
                                        Ok(l) => println!("[Java:stdout] {}", l),
                                        Err(e) => eprintln!("[Java:stdout-err] {}", e),
                                    }
                                }
                            });
                        }

                        // Capture stderr in a separate thread
                        if let Some(stderr) = child.stderr.take() {
                            thread::spawn(move || {
                                let reader = BufReader::new(stderr);
                                for line in reader.lines() {
                                    match line {
                                        Ok(l) => eprintln!("[Java:stderr] {}", l),
                                        Err(e) => eprintln!("[Java:stderr-err] {}", e),
                                    }
                                }
                            });
                        }

                        let pid = child.id();
                        log(app, &format!("Java process spawned, PID: {:?}", pid));

                        if let Some(state) = app.try_state::<BackendProcess>() {
                            *state.0.lock().unwrap() = Some(child);
                        }

                        // Health check in background
                        let status_handle = app.state::<BackendStatus>();
                        thread::spawn(move || {
                            println!("[Backend] Waiting for backend to become ready...");
                            for i in 1..=60 {
                                std::thread::sleep(std::time::Duration::from_secs(1));
                                match std::net::TcpStream::connect("127.0.0.1:18080") {
                                    Ok(_) => {
                                        println!("[Backend] ✅ Backend is ready (attempt {}/60)", i);
                                        *status_handle.0.lock().unwrap() = "ready".to_string();
                                        return;
                                    }
                                    Err(e) => {
                                        if i % 10 == 0 {
                                            println!("[Backend] ⏳ Backend not ready yet (attempt {}/60): {}", i, e);
                                        }
                                    }
                                }
                            }
                            eprintln!("[Backend] ❌ Backend did not become ready within 60 seconds!");
                            *status_handle.0.lock().unwrap() = "failed".to_string();
                        });
                    }
                    Err(e) => {
                        log(app, &format!("Failed to spawn Java process: {}", e));
                        if let Some(status) = app.try_state::<BackendStatus>() {
                            *status.0.lock().unwrap() = format!("spawn_error: {}", e);
                        }
                    }
                }
            } else {
                log(app, "Backend JAR not found!");

                // List what's actually in the resource dir
                if let Ok(entries) = std::fs::read_dir(&resource_dir) {
                    log(app, "Resource dir contents:");
                    for entry in entries.flatten() {
                        log(app, &format!("  - {:?}", entry.path()));
                    }
                }
                if let Ok(entries) = std::fs::read_dir(resource_dir.join("backend")) {
                    log(app, "backend/ contents:");
                    for entry in entries.flatten() {
                        log(app, &format!("  - {:?}", entry.path()));
                    }
                } else {
                    log(app, "backend/ directory does not exist!");
                }

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

/// Find bundled JRE java binary, fallback to system "java"
fn find_java(resource_dir: &std::path::Path) -> String {
    #[cfg(target_os = "windows")]
    let jre_bin = resource_dir.join("backend").join("jre").join("bin").join("java.exe");

    #[cfg(not(target_os = "windows"))]
    let jre_bin = resource_dir.join("backend").join("jre").join("bin").join("java");

    if jre_bin.exists() {
        println!("[Backend] Using bundled JRE: {:?}", jre_bin);
        return jre_bin.to_string_lossy().to_string();
    }

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            #[cfg(target_os = "windows")]
            let dev_jre = exe_dir.join("..").join("backend").join("jre").join("bin").join("java.exe");

            #[cfg(not(target_os = "windows"))]
            let dev_jre = exe_dir.join("..").join("backend").join("jre").join("bin").join("java");

            if dev_jre.exists() {
                println!("[Backend] Using dev JRE: {:?}", dev_jre);
                return dev_jre.to_string_lossy().to_string();
            }
        }
    }

    println!("[Backend] No bundled JRE found, using system java");
    "java".to_string()
}

/// Find a file in resource dir, trying exact path then glob pattern
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
