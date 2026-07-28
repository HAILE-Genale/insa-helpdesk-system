package com.insa.helpdesk.user.controller;

import com.insa.helpdesk.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @RequestMapping("/id")
    public String user()
    {
        return "server is runing";
    }
}
