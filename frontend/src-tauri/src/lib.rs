#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::Manager;

struct BackendProcess(Mutex<Option<Child>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(BackendProcess(Mutex::new(None)))
        .setup(|app| {
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

                let child = Command::new("java")
                    .args([
                        "-jar",
                        &jar_str,
                        "--server.port=18080",
                        "--server.address=127.0.0.1",
                        "--spring.profiles.active=desktop",
                    ])
                    .spawn()
                    .expect("Failed to spawn Java backend");

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
        .invoke_handler(tauri::generate_handler![])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // Run app and handle exit
    app.run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            if let Some(state) = app_handle.try_state::<BackendProcess>() {
                if let Some(child) = state.0.lock().unwrap().as_mut() {
                    let _ = child.kill();
                    println!("Java backend terminated on exit");
                }
            }
        }
    });
}
