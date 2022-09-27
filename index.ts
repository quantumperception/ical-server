import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ical, {
  ICalCalendar,
  ICalCalendarData,
  ICalCalendarMethod,
  ICalDateTimeValue,
  ICalEvent,
  ICalEventClass,
  ICalEventData,
} from "ical-generator";
import bp from "body-parser";

dotenv.config();

type Reservation = {
  start: Date;
  end: Date;
  grid_connection: number;
  connector: number;
  user: number;
};

type IcalReservation = {
  start: Date;
  end: Date;
  summary: string;
  location: string;
  description: string;
  url: string;
};

const app: Express = express();
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
const port = process.env.PORT;

const today = new Date();
const today_day = today.getDate();
const today_month = today.getMonth();
const today_year = today.getFullYear();

const calendar: ICalCalendar = ical({ name: "testCalendar" });
for (let i = 0; i < 5; i++) {
  const newEvent = {
    id: i,
    start: new Date(today_year, today_month, today_day + i, 12),
    end: new Date(today_year, today_month, today_day + i, 12, 45),
    summary: i + "Example Event",
    description:
      '{"connector":32,"user":62,"status":"Scheduled","grid_connection":6}',
    location: i + "my room",
    url: i + "http://sebbo.net/",
  };
  calendar.createEvent(newEvent);
}

const events: ICalEvent[] | undefined = calendar.events();

app.get("/reservations", (req: Request, res: Response) => {
  res.send(calendar.toString());
});

app.put("/reservations/:id", (req: Request, res: Response) => {
  const r: Reservation = req.body;
  const reservation: ICalEvent | undefined = events.find(
    (e) => e.id() === req.params.id
  );
  if (reservation) {
    const reservationIndex: number = events.indexOf(reservation);
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

app.post("/reservations", (req: Request, res: Response) => {
  const r: Reservation = req.body;
  const newReservation: IcalReservation = {
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

app.delete("/reservations/:id", (req: Request, res: Response) => {
  const event: ICalEvent | undefined = calendar
    .events()
    .find((e) => e.id() === req.params.id);
  if (!!!event) {
    return res.status(404).send("Reserva no encontrada");
  }
  const eventIndex: number = events.indexOf(event);
  events.splice(eventIndex, 1);
  console.log(calendar.events().map((e) => e.id()));
  return res.status(204).send();
});

app.get("/reservations/:id", (req: Request, res: Response) => {
  const event: ICalEvent | undefined = calendar
    .events()
    .find((e) => e.id() === req.params.id);
  if (!!!event) {
    return res.status(404).send("Reserva no encontrada");
  }
  return res.send(event.toString());
});

app.get("/", (req: Request, res: Response) => {
  res.send("Test Agendamiento API");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
