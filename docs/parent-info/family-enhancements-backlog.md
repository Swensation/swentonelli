# Scouty Planner: Project Backlog

*Source: Family Ideation Backlog (Google Doc)*

This document tracks future hardware integrations, automation ideas, and household quality-of-life enhancements for the Swentonelli Family Dashboard.

---

## 1. Hardware Integration Projects

| Project Name | The Goal | The Hardware / Integration | Success Looks Like |
| :--- | :--- | :--- | :--- |
| **The Auto-Checklist Printer** | Stop the chaos of trying to remember what to pack when the family leaves the house. Teach the system what items belong with which person for different activities. | Brother Network Printer | When Dad yells *"We're leaving for the pool in 10 minutes!"*, the system instantly prints a custom, physical checklist of exactly what everyone needs to bring. |
| **The Practice Cancellation Siren** | Never miss a last-minute schedule change again. Teach the system how to read incoming, messy emails from coaches and schools, figure out if something was canceled or delayed, and take over the house speakers to make an announcement. | Alexa / Echo Speakers | When a coach emails that practice is rained out, the house automatically announces *"Soccer is canceled!"* on repeat until someone presses the *"We hear you"* button on the dashboard. |
| **The Backyard Water Boss** | Control the yard's water based on real-world conditions or the sudden need for a water fight. Write the rules that decide when the sprinklers should or shouldn't run. | Smart Sprinklers & live weather data | When someone hits the *"Water Fight"* button on the dashboard, the lawn sprinklers instantly turn on—but only if the system checks the weather and sees it isn't already raining outside. |
| **The Climate & Garage Sentry** | Keep the house secure and stop us from wasting money on heating and cooling. Write the rules that monitor the doors and the temperature at the same time. | Smart Garage Door Opener & Ecobee / Samsung Thermostats | If someone leaves the garage door wide open in the freezing cold, the system warns the house through the speakers and automatically dials back the thermostat so we aren't paying to heat the whole neighborhood. |
| **The Device Locator Radar** | Find lost iPads, phones, or Chromebooks without tearing the house apart. Figure out how to connect the dashboard to Apple/FindMy networks and the house's smart plugs. | iOS/FindMy pings & Smart Outlets | When someone asks the dashboard *"Where is my iPad?"*, the system makes the lost device chime and flashes a physical lamp in the room where it's hiding. |
| **The Scout Tracker** | Keep a constant, automated eye on our beagle. Connect Scout's collar to the dashboard so he has his own live-updating profile, letting everyone know what he's up to and if he's safe. | Halo Collar | If Scout wanders too close to the edge of his yard boundary, the dashboard instantly flashes a warning and pulls up a map showing exactly where he is. |
| **The Shed Security Guard** | Ensure the tools and equipment in the backyard shed remain secure. Write the rules for monitoring the shed's status. | Shed Door Sensor (or existing smart lock) & Alexa / Echo Speakers | If the shed door is opened after 10 PM, an alert is pushed to Dad's phone, and the house speakers softly announce *"The shed has been opened"*. |
| **The Holiday Light Director** | Automate the festive lighting based on time of day, weather, or special occasions. | Smart Outlets (controlling Christmas lights) | As soon as the sun sets, the Christmas lights turn on automatically, but they stay off if the weather forecast predicts severe storms. |
| **The Trash Day Enforcer** | Never forget to take the trash out again, especially during holiday weeks when the schedule shifts. | Alexa / Echo Speakers & Calendar API | Every Monday at 7 PM, the house announces *"Please take the trash to the curb,"* unless it's a holiday week, in which case it reminds everyone on Tuesday instead. |

---

## 2. Information & Maintenance Projects

| Project Name | The Goal | The Hardware / Integration | Success Looks Like |
| :--- | :--- | :--- | :--- |
| **The Chore Bounty Board** | Turn mundane household chores into an active gig economy. Dad can post specific chores with dollar bounties, and the kids can claim them to earn money. | Dashboard UI & Firebase internal ledger | When Dad posts *"Pick up dog toys in the yard - $3"*, a kid can hit *"Claim"* on the dashboard, do the job, and automatically see their dashboard wallet balance go up by $3. |
| **The Movie Night Scout** | Keep track of what new shows and movies are available without endlessly scrolling across apps. | Streaming Service APIs (e.g., TMDB) or RSS feeds | On Friday afternoons, the dashboard updates with a curated list of new family-friendly movies released that week across our streaming platforms. |
| **The Home Health Monitor** | Help Dad stay on top of regular house maintenance tasks before they become big problems. | Calendar API & Dashboard UI | The dashboard automatically generates a prominent alert when it's time to change the HVAC air filter or schedule the annual furnace checkup, complete with a button to text the HVAC company. |
| **The Chore Gamifier** | Make completing household tasks more rewarding. | Dashboard UI & Smart Sprinklers/Outlets (for rewards) | When a kid logs that they've finished their chores for the week on the dashboard, it unlocks the *"Water Fight"* button for the sprinklers for the weekend. |
| **The Weather Wardrobe Advisor** | Stop the morning arguments about whether someone needs a coat. | Weather API & Dashboard UI | Every morning, the dashboard displays a clear, emoji-based recommendation for what to wear based on the local weather forecast (e.g., 🧥 for coats, ☂️ for rain). |
| **The 'Is Dad in a Meeting?' Indicator** | Prevent accidental interruptions when working from home. | Dad's Work Calendar API & Smart Outlet (controlling an indicator light) | When Dad's calendar shows a meeting, a red light turns on outside his office, and the dashboard clearly states *"Dad is on a call"*. |
| **The Meal Plan Broadcaster** | Stop the daily *"What's for dinner?"* question before it starts. | Shared Recipe Doc/API & Dashboard UI | The dashboard prominently displays tonight's planned dinner, complete with an estimated time and a list of who is helping prep. |

---

## 3. Platform Administration

| Project Name | The Goal | The Hardware / Integration | Success Looks Like |
| :--- | :--- | :--- | :--- |
| **The Plumber (Dad Admin)** | Make sure the kids' code can actually talk to the house safely. Set up the Next.js/Firebase plumbing. | Firebase / Cloud Functions / API Gateways | When the family hits a button on their new dashboard, Dad's backend wiring successfully passes the message to the real-world hardware without the house catching on fire. |
