package com.ainovelstudio.backup.device;

import com.ainovelstudio.backup.user.User;
import com.ainovelstudio.backup.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {
    private final DeviceRepository deviceRepository;
    private final UserService userService;

    public Device registerDevice(UUID userId, String deviceName, String deviceType) {
        User user = userService.findById(userId);
        return deviceRepository.findByUserIdAndDeviceName(userId, deviceName)
                .map(existing -> {
                    existing.setLastSeenAt(LocalDateTime.now());
                    return deviceRepository.save(existing);
                })
                .orElseGet(() -> {
                    Device device = new Device();
                    device.setUser(user);
                    device.setDeviceName(deviceName);
                    device.setDeviceType(deviceType);
                    device.setLastSeenAt(LocalDateTime.now());
                    return deviceRepository.save(device);
                });
    }

    public List<Device> listDevices(UUID userId) {
        return deviceRepository.findByUserId(userId);
    }

    public void removeDevice(UUID userId, UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("设备不存在"));
        if (!device.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权操作此设备");
        }
        deviceRepository.delete(device);
    }

    public void updateLastBackup(UUID deviceId) {
        deviceRepository.findById(deviceId).ifPresent(device -> {
            device.setLastBackupAt(LocalDateTime.now());
            device.setLastSeenAt(LocalDateTime.now());
            deviceRepository.save(device);
        });
    }
}
