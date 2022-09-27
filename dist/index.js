"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const ical_generator_1 = __importDefault(require("ical-generator"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
const port = process.env.PORT;
const today = new Date();
const today_day = today.getDate();
const today_month = today.getMonth();
const today_year = today.getFullYear();
const calendar = (0, ical_generator_1.default)({ name: "testCalendar" });
for (let i = 0; i < 5; i++) {
    const newEvent = {
        id: i,
        start: new Date(today_year, today_month, today_day + i, 12),
        end: new Date(today_year, today_month, today_day + i, 12, 45),
        summary: i + "Example Event",
        description: '{"connector":32,"user":62,"status":"Scheduled","grid_connection":6}',
        location: i + "my room",
        url: i + "http://sebbo.net/",
    };
    calendar.createEvent(newEvent);
}
const events = calendar.events();
app.get("/reservations", (req, res) => {
    res.send(calendar.toString());
});
app.put("/reservations/:id", (req, res) => {
    const r = req.body;
    const reservation = events.find((e) => e.id() === req.params.id);
    if (reservation) {
        const reservationIndex = events.indexOf(reservation);
        calendar.events().splice(reservationIndex, 1);
        calendar.createEvent({
            id: reservation.id(),
            start: r.start,
            end: r.end,
            description: `{"connector":${r.connector},"user":${r.user},"status":"Scheduled","grid_connection":${r.grid_connection}}`,
            summary: reservation.summary(),
            location: reservation.location(),
            url: reservation.url(),
        });
        console.log(r.start);
        res.send(events[reservationIndex].toString());
    }
});
app.post("/reservations", (req, res) => {
    const r = req.body;
    const newReservation = {
        start: new Date(r.start),
        end: new Date(r.end),
        summary: "Reserva",
        location: "krek",
        description: `{"connector":${r.connector},"user":${r.user},"status":"Scheduled","grid_connection":${r.grid_connection}}`,
        url: "www.enerlink.com",
    };
    const newEvent = calendar.createEvent(newReservation);
    console.log(calendar.events().map((e) => e.id()));
    return res.send(newEvent.toString());
});
app.delete("/reservations/:id", (req, res) => {
    const event = calendar
        .events()
        .find((e) => e.id() === req.params.id);
    if (!!!event) {
        return res.status(404).send("Reserva no encontrada");
    }
    const eventIndex = events.indexOf(event);
    events.splice(eventIndex, 1);
    console.log(calendar.events().map((e) => e.id()));
    return res.status(204).send();
});
app.get("/reservations/:id", (req, res) => {
    const event = calendar
        .events()
        .find((e) => e.id() === req.params.id);
    if (!!!event) {
        return res.status(404).send("Reserva no encontrada");
    }
    return res.send(event.toString());
});
app.get("/", (req, res) => {
    res.send("Test Agendamiento API");
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
