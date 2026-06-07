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
            let resource_dir = app
                .path()
                .resource_dir()
                .expect("failed to get resource dir");

            // Find JAR
            let jar_path = find_file(&resource_dir, "backend/novel-studio-backend.jar", "novel-studio-backend*.jar");

            if let Some(jar) = jar_path {
                // Find Java: prefer bundled JRE, fallback to system java
                let java_cmd = find_java(&resource_dir);

                let jar_str = jar.to_string_lossy().to_string();
                println!("Starting backend: {} -jar {}", java_cmd, jar_str);

                let child = Command::new(&java_cmd)
                    .args([
                        "-jar",
                        &jar_str,
                        "--server.port=18080",
                        "--server.address=127.0.0.1",
                        "--spring.profiles.active=desktop",
                    ])
                    .spawn()
                    .expect("Failed to spawn Java backend");

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
