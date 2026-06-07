#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::ShellExt;

struct BackendProcess(Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            app.manage(BackendProcess(Mutex::new(None)));

            // Determine JAR path
            let resource_dir = app
                .path()
                .resource_dir()
                .expect("failed to get resource dir");
            let jar_path = resource_dir.join("backend").join("novel-studio-backend.jar");

            // Also check dev paths
            let dev_jar_paths = vec![
                app.path()
                    .app_local_data_dir()
                    .ok()
                    .map(|p| p.join("backend").join("novel-studio-backend.jar")),
                Some(std::path::PathBuf::from("../backend/target/novel-studio-backend-0.1.0.jar")),
            ];

            let active_jar = if jar_path.exists() {
                Some(jar_path)
            } else {
                dev_jar_paths.into_iter().flatten().find(|p| p.exists())
            };

            if let Some(jar) = active_jar {
                let jar_str = jar.to_string_lossy().to_string();
                println!("Starting backend from: {}", jar_str);

                let shell = app.shell();
                let (rx, child) = shell
                    .command("java")
                    .args([
                        "-jar",
                        &jar_str,
                        "--server.port=18080",
                        "--server.address=127.0.0.1",
                        "--spring.profiles.active=desktop",
                    ])
                    .spawn()
                    .expect("Failed to spawn Java backend");

                // Listen for backend output
                let rx_clone = rx;
                tauri::async_runtime::spawn(async move {
                    use tauri_plugin_shell::process::CommandEvent;
                    while let Ok(event) = rx_clone.recv().await {
                        match event {
                            CommandEvent::Stdout(line) => {
                                let s = String::from_utf8_lossy(&line);
                                println!("[backend] {}", s);
                            }
                            CommandEvent::Stderr(line) => {
                                let s = String::from_utf8_lossy(&line);
                                eprintln!("[backend] {}", s);
                            }
                            CommandEvent::Terminated(status) => {
                                println!("Backend terminated with status: {:?}", status);
                                break;
                            }
                            _ => {}
                        }
                    }
                });

                // Store child for cleanup
                if let Some(state) = app.try_state::<BackendProcess>() {
                    *state.0.lock().unwrap() = Some(child);
                }

                println!("Java backend started on 127.0.0.1:18080");
            } else {
                eprintln!("WARNING: Backend JAR not found. Backend will not start.");
            }

            Ok(())
        })
        .on_event(|app, event| {
            if let RunEvent::Exit = event {
                // Kill Java backend on app exit
                if let Some(state) = app.try_state::<BackendProcess>() {
                    if let Some(child) = state.0.lock().unwrap().take() {
                        let _ = child.kill();
                        println!("Java backend terminated on exit");
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
