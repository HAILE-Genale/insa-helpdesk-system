package com.helpdesk.ticket;

/**
 * Support / service-provider teams a ticket can be routed to (FR-023: assign
 * tickets to support teams; FR-025: assign based on category/expertise).
 *
 * Teams for this technology institute deployment:
 *  - NETWORKING       Internet, VPN, LAN/Wi-Fi, switches, routers
 *  - ELECTRICIAN      Power, wiring, outlets, UPS, lighting
 *  - SOFTWARE         Applications, ERP, email, OS, licensing
 *  - HARDWARE         Laptops, desktops, printers, peripherals
 *  - AV_SYSTEMS       Projectors, smart classrooms, servers, lab systems, CCTV
 *                     (the extra team relevant to a technology institute,
 *                      where classrooms/labs depend on AV and server uptime)
 */
public enum ServiceTeam {
    NETWORKING,
    ELECTRICIAN,
    SOFTWARE,
    HARDWARE,
    AV_SYSTEMS
}
