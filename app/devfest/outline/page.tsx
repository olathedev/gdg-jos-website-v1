"use client";
import DevfestLayout from "@/layouts/DevfestLayout";
import { ArrowUpRight } from "lucide-react";
import React, { useState } from "react";

const bgVariants = [
  "bg-[#FFF6F9]",
  "bg-[#FFFBEA]",
  "bg-[#E9FAFC]",
  "bg-[#F5F5F5] text-[#232323]",
];

const typeColors: any = {
  Activity: "bg-transparent text-[#F6BE2C] border-[#F6BE2C]",
  Talk: "bg-transparent text-[#4285F4] border-[#4285F4]",
  "Special Feature": "bg-transparent text-[#34A853] border-[#34A853]",
};

const Outline = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const schedule = [
    {
      time: "09:00-09:30",
      activity: "Arrival, Registration & Swag Collection",
      type: "Activity",
    },
    {
      time: "09:30-09:45",
      activity: "Icebreaker & Welcome",
      speaker: "Host-Stephanie",
      type: "Activity",
    },
    {
      time: "09:45-10:00",
      activity: "Community Hour",
      speaker: "Stephen Nwoye",
      type: "Talk",
    },
    {
      time: "10:00-10:20",
      activity: "Keynote Speaker",
      speaker: "Sodiq Akinjoba (Google Developer Ecosystem Community Manager)",
      type: "Talk",
    },
    {
      time: "10:20-10:25",
      activity: "Video Message",
      speaker: "Mr. Dickson Nsofor (Kora CEO)",
      type: "Special Feature",
    },
    {
      time: "10:25-10:35",
      activity: "Speaker 1",
      speaker: "Johnstone Kpilaakaa (10 mins)",
      type: "Talk",
    },
    {
      time: "10:35-10:45",
      activity: "Speaker 2",
      speaker: "Daser David (10 mins)",
      type: "Talk",
    },
    {
      time: "10:45-10:55",
      activity: "Quick Audience Game / Raffle",
      type: "Activity",
    },
    {
      time: "10:55-11:05",
      activity: "Speaker 3",
      speaker: "Samuel Gwott (10 mins)",
      type: "Talk",
    },
    {
      time: "11:05-11:15",
      activity: "Speaker 4",
      speaker: "Paul Umaru (10 mins)",
      type: "Talk",
    },
    {
      time: "11:15-11:25",
      activity: "Speaker 5",
      speaker: "Kefiano Kefas Ropshik (10 mins)",
      type: "Talk",
    },
    {
      time: "11:25-11:40",
      activity: "Demo 1",
      speaker: "Video from Kora",
      type: "Special Feature",
    },
    {
      time: "11:40-12:10",
      activity:
        "Panel Session 1: Building Plateau's tourism and scaling it globally through technology",
      speaker:
        "Moderator: Nana Theresa Timothy\nPanelists:\n1. Tabitha Hris - HrisHub Int.\n2. Longji Theodore - nHub Nigeria\n3. Datong Dominic Gwaman - PICTDA\n4. Manji Wilson - Chief Technical Adviser\n5. Timothy Kunat - Discover Jos, Founder",
      type: "Activity",
    },
    {
      time: "12:10-13:00",
      activity:
        "Breakout Sessions\n· Future Innovators - Future Feat\n· Rapid AI development with Firebased studio - Umar Zubairu\n· Power Woman (WTM) - Salome Solomon",
      type: "Activity",
    },
    {
      time: "13:00-13:40",
      activity: "Lunch Break & Networking",
      type: "Activity",
    },
    {
      time: "13:40-14:10",
      activity:
        "Panel Session 2: Building Safe, Secure and Scalable Solutions with AI and Cloud",
      speaker:
        "Moderator: Catherine R. Wuyep\nPanelists:\n1. Sodiq Akinjoba - Google Developer Ecosystem Community Manager\n2. Robert John - GDE (ML & GCP), Arm Ambassador\n3. Auwal Muhammad - Lead Developer Relations & Integration at Moniepoint\n4. Loreta Tohomdet - Google Developer Lead, Jos",
      type: "Activity",
    },
    {
      time: "14:10-14:25",
      activity: "Speaker 6",
      speaker: "Moses Amama (15 mins)",
      type: "Talk",
    },
    {
      time: "14:25-14:40",
      activity: "Speaker 7",
      speaker: "Gabriella Amaefule (15 mins)",
      type: "Talk",
    },
    {
      time: "14:40-14:55",
      activity: "Speaker 8",
      speaker: "Mileke Kolawale (15 mins)",
      type: "Activity",
    },
    {
      time: "14:55-15:00",
      activity: "Community Energizer: Techies Dance / Icebreaker 2",
      type: "Talk",
    },
    {
      time: "15:00-15:15",
      activity: "Speaker 9",
      speaker: "Joshua Ajagbe (15 mins)",
      type: "Talk",
    },
    {
      time: "15:15-15:25",
      activity: "Speaker 10",
      speaker: "Yusuf Ahmed (10 mins)",
      type: "Talk",
    },
    {
      time: "15:25-15:35",
      activity: "Speaker 11",
      speaker: "Prince Konwea (15 mins)",
      type: "Talk",
    },
    {
      time: "15:35-15:45",
      activity: "Speaker 12",
      speaker: "Oluwatobi Akanji (10 mins)",
      type: "Talk",
    },
    {
      time: "15:45-15:55",
      activity: "Speaker 13",
      speaker: "Jatau Shedrack (10 mins)",
      type: "Talk",
    },
    {
      time: "15:55-16:00",
      activity: "Final Demo: Video of Hackaton",
      type: "Talk",
    },
    {
      time: "16:00-16:30",
      activity: "Awards & Recognition Closing Remarks",
      type: "Activity",
    },
    {
      time: "16:30-17:00",
      activity: "Group Pictures",
      type: "Activity",
    },
  ];

  const filteredSchedule = schedule.filter(
    (event) =>
      event.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.speaker && event.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DevfestLayout>
      <section className="container mx-auto px-2 md:px-10 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Event Outline
        </h1>
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search activities or speakers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 rounded-xl border border-[#F6BE2C] text-textDark focus:outline-none focus:ring-1 focus:ring-[#F6BE2C] bg-white"
          />
        </div>

        {/* Mobile Card/List Layout */}
        <div className="flex flex-col gap-3 md:hidden">
          {filteredSchedule.map((event, idx) => (
            <div
              key={idx}
              className={`rounded-lg ${bgVariants[idx % bgVariants.length]} p-4 flex flex-col gap-2 shadow-sm`}
            >
              <div className="flex items-center gap-2 text-xs font-normal">
                <span className="inline-block w-2 h-2 rounded-full bg-[#F6BE2C]" />
                <span className="font-medium">{event.time}</span>
              </div>
              <div className="font-semibold text-[15px]">{event.activity}</div>
              <div className="text-sm font-normal">
                {event.speaker ? (
                  event.speaker.includes("\n") ? (
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      {event.speaker.split("\n").map((line, i) => (
                        <li key={i} className="pl-1">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>{event.speaker}</span>
                  )
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
              <div>
                <span
                  className={`inline-block py-1 rounded text-xs font-medium ${
                    typeColors[event.type] || "border-gray-200 text-gray-700"
                  }`}
                >
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="text-gray-700 text-left text-base md:text-lg font-medium pb-2">
                  Time
                </th>
                <th className="text-gray-700 text-left text-base md:text-lg font-semibold pb-2">
                  Activity
                </th>
                <th className="text-gray-700 text-left text-base md:text-lg font-medium pb-2">
                  Speaker
                </th>
                <th className="text-left text-base md:text-lg font-medium pb-2">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((event, idx) => (
                <tr
                  key={idx}
                  className={`rounded-xl ${bgVariants[idx % bgVariants.length]} text-[16px] md:text-[17px]`}
                  style={{ fontSize: "16px" }}
                >
                  <td className="rounded-l-xl px-4 py-3 font-medium whitespace-nowrap">
                    <span className="flex items-center text-sm gap-2 font-normal">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#F6BE2C]"></span>
                      {event.time}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-[15px] break-words max-w-xs md:max-w-md whitespace-pre-line">
                    {event.activity}
                  </td>
                  <td className="px-4 py-3 font-medium align-top">
                    {event.speaker ? (
                      event.speaker.includes("\n") ? (
                        <ul className="list-disc list-inside text-sm font-normal space-y-1 pl-2">
                          {event.speaker.split("\n").map((line, i) => (
                            <li key={i} className="pl-1">
                              {line}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="block text-sm font-normal">
                          {event.speaker}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400 text-sm font-normal">—</span>
                    )}
                  </td>
                  <td className="rounded-r-xl px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    
                        typeColors[event.type] || "border-gray-200 text-gray-700"
                      }`}
                    >
                      {event.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-10 gap-4">
          <a
            href="/tickets"
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold text-base hover:bg-[#232323] transition"
          >
            Get Ticket <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </DevfestLayout>
  );
};

export default Outline;