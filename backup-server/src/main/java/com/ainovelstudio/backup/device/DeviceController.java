package com.ainovelstudio.backup.device;

import com.ainovelstudio.backup.common.ApiResponse;
import com.ainovelstudio.backup.user.User;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping
    public ApiResponse<Device> register(Authentication auth, @RequestBody RegisterDeviceRequest req) {
        User user = (User) auth.getPrincipal();
        Device device = deviceService.registerDevice(user.getId(), req.getDeviceName(), req.getDeviceType());
        return ApiResponse.ok(device);
    }

    @GetMapping
    public ApiResponse<List<Device>> list(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.ok(deviceService.listDevices(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(Authentication auth, @PathVariable UUID id) {
        User user = (User) auth.getPrincipal();
        deviceService.removeDevice(user.getId(), id);
        return ApiResponse.ok("设备已移除", null);
    }

    @Data
    public static class RegisterDeviceRequest {
        @NotBlank
        private String deviceName;
        @NotBlank
        private String deviceType;
    }
}
