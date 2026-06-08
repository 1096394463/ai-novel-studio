#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use tauri::Manager;

struct BackendProcess(Mutex<Option<Child>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(BackendProcess(Mutex::new(None)))
        .setup(|app| {
            let resource_dir = app
                .path()
                .resource_dir()
                .expect("failed to get resource dir");

            println!("[Backend] Resource dir: {:?}", resource_dir);

            // Find JAR
            let jar_path = find_file(&resource_dir, "backend/novel-studio-backend.jar", "novel-studio-backend*.jar");

            if let Some(jar) = jar_path {
                // Find Java: prefer bundled JRE, fallback to system java
                let java_cmd = find_java(&resource_dir);
                let jar_str = jar.to_string_lossy().to_string();

                println!("[Backend] JAR path: {}", jar_str);
                println!("[Backend] Java command: {}", java_cmd);
                println!("[Backend] Spawning: {} -jar {} --server.port=18080 --spring.profiles.active=desktop", java_cmd, jar_str);

                let mut child = Command::new(&java_cmd)
                    .args([
                        "-jar",
                        &jar_str,
                        "--server.port=18080",
                        "--server.address=127.0.0.1",
                        "--spring.profiles.active=desktop",
                    ])
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped())
                    .spawn()
                    .expect("Failed to spawn Java backend");

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
                println!("[Backend] Java process spawned, PID: {:?}", pid);

                if let Some(state) = app.try_state::<BackendProcess>() {
                    *state.0.lock().unwrap() = Some(child);
                }

                // Health check in background
                thread::spawn(|| {
                    println!("[Backend] Waiting for backend to become ready...");
                    for i in 1..=30 {
                        std::thread::sleep(std::time::Duration::from_secs(1));
                        match std::net::TcpStream::connect("127.0.0.1:18080") {
                            Ok(_) => {
                                println!("[Backend] ✅ Backend is ready (attempt {}/30)", i);
                                return;
                            }
                            Err(e) => {
                                if i % 5 == 0 {
                                    println!("[Backend] ⏳ Backend not ready yet (attempt {}/30): {}", i, e);
                                }
                            }
                        }
                    }
                    eprintln!("[Backend] ❌ Backend did not become ready within 30 seconds!");
                });
            } else {
                eprintln!("[Backend] ❌ Backend JAR not found!");
                eprintln!("[Backend]    Resource dir: {:?}", resource_dir);
                eprintln!("[Backend]    Expected: backend/novel-studio-backend.jar");
                eprintln!("[Backend]    Searched dev paths: ../backend/target/novel-studio-backend-0.1.0.jar");
                // List what's actually in the resource dir
                if let Ok(entries) = std::fs::read_dir(&resource_dir) {
                    eprintln!("[Backend]    Resource dir contents:");
                    for entry in entries.flatten() {
                        eprintln!("[Backend]      - {:?}", entry.path());
                    }
                }
                if let Ok(entries) = std::fs::read_dir(resource_dir.join("backend")) {
                    eprintln!("[Backend]    backend/ contents:");
                    for entry in entries.flatten() {
                        eprintln!("[Backend]      - {:?}", entry.path());
                    }
                } else {
                    eprintln!("[Backend]    backend/ directory does not exist!");
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
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
    // Check bundled JRE in resource directory
    #[cfg(target_os = "windows")]
    let jre_bin = resource_dir.join("backend").join("jre").join("bin").join("java.exe");

    #[cfg(not(target_os = "windows"))]
    let jre_bin = resource_dir.join("backend").join("jre").join("bin").join("java");

    if jre_bin.exists() {
        println!("Using bundled JRE: {:?}", jre_bin);
        return jre_bin.to_string_lossy().to_string();
    }

    // Also check relative to exe (for dev mode)
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            #[cfg(target_os = "windows")]
            let dev_jre = exe_dir.join("..").join("backend").join("jre").join("bin").join("java.exe");

            #[cfg(not(target_os = "windows"))]
            let dev_jre = exe_dir.join("..").join("backend").join("jre").join("bin").join("java");

            if dev_jre.exists() {
                println!("Using dev JRE: {:?}", dev_jre);
                return dev_jre.to_string_lossy().to_string();
            }
        }
    }

    println!("No bundled JRE found, using system java");
    "java".to_string()
}

/// Find a file in resource dir, trying exact path then glob pattern
fn find_file(resource_dir: &std::path::Path, exact: &str, _pattern: &str) -> Option<std::path::PathBuf> {
    let path = resource_dir.join(exact);
    if path.exists() {
        return Some(path);
    }

    // Try dev mode paths
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
