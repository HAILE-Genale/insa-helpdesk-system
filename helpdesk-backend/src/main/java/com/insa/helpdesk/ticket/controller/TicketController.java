package com.insa.helpdesk.ticket.controller;

import com.insa.helpdesk.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;
    @RequestMapping("/get")
    public String starting()
    {
    
        return "hello from the ticket";

    }

}
