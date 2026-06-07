package com.ainovelstudio.backup.auth;

import com.ainovelstudio.backup.common.ApiResponse;
import com.ainovelstudio.backup.dto.*;
import com.ainovelstudio.backup.user.User;
import com.ainovelstudio.backup.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authManager;

    @PostMapping("/register")
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.register(req.getUsername(), req.getEmail(), req.getPassword(), req.getNickname());
        String access = tokenProvider.generateAccessToken(user.getId(), user.getUsername());
        String refresh = tokenProvider.generateRefreshToken(user.getId());
        return ApiResponse.ok(new TokenResponse(access, refresh, user.getUsername(), user.getNickname()));
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        User user = (User) auth.getPrincipal();
        String access = tokenProvider.generateAccessToken(user.getId(), user.getUsername());
        String refresh = tokenProvider.generateRefreshToken(user.getId());
        return ApiResponse.ok(new TokenResponse(access, refresh, user.getUsername(), user.getNickname()));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        if (!tokenProvider.validateToken(req.getRefreshToken()) ||
                !"refresh".equals(tokenProvider.getTokenType(req.getRefreshToken()))) {
            return ApiResponse.error("无效的 refreshToken");
        }
        UUID userId = tokenProvider.getUserIdFromToken(req.getRefreshToken());
        User user = userService.findById(userId);
        String access = tokenProvider.generateAccessToken(user.getId(), user.getUsername());
        String refresh = tokenProvider.generateRefreshToken(user.getId());
        return ApiResponse.ok(new TokenResponse(access, refresh, user.getUsername(), user.getNickname()));
    }

    @GetMapping("/me")
    public ApiResponse<UserInfo> me(Authentication auth) {
        User user = (User) auth.getPrincipal();
        UserInfo info = new UserInfo();
        info.setId(user.getId());
        info.setUsername(user.getUsername());
        info.setEmail(user.getEmail());
        info.setNickname(user.getNickname());
        info.setStorageQuotaMb(user.getStorageQuotaMb());
        info.setStorageUsedBytes(user.getStorageUsedBytes());
        return ApiResponse.ok(info);
    }

    @lombok.Data
    public static class UserInfo {
        private java.util.UUID id;
        private String username;
        private String email;
        private String nickname;
        private Integer storageQuotaMb;
        private Long storageUsedBytes;
    }
}
