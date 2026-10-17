-- Brain Blitz: DevFest Jos and Google product questions, 10 per round.
-- The earlier AI/web/security sets are only taken out of the rounds (quiz_round = null), not deleted.
-- round = 'daily' with no opens_on keeps these out of the Phase 1 learning quiz.

update quest_quiz_items set quiz_round = null where quiz_round is not null;

insert into quest_quiz_items (slug, round, track, learn, question, options, correct, explanation, sort, quiz_round) values
-- Round 1
('bb1-date', 'daily', 'DevFest Jos', 'DevFest Jos 2026 is on Saturday, 17 October.', 'What date is DevFest Jos 2026?',
  '["Sat, 10 Oct", "Sat, 17 Oct", "Sat, 24 Oct", "Sat, 31 Oct"]', 1, 'Saturday, 17 October 2026.', 0, 1),
('bb1-venue', 'daily', 'DevFest Jos', 'DevFest Jos 2026 is at Odilin''s Event Center, behind the National Library.', 'Where is DevFest Jos 2026 happening?',
  '["University of Jos main hall", "Plateau Hotel", "Odilin''s Event Center", "Rayfield Resort"]', 2, 'Odilin''s Event Center, 5/6 Nunku Street, behind the National Library.', 1, 1),
('bb1-theme', 'daily', 'DevFest Jos', 'The DevFest Jos 2026 theme is Build for the agentic era.', 'What is the DevFest Jos 2026 theme?',
  '["Build for the agentic era", "Mobile first, always", "Back to basics", "Code the Plateau"]', 0, 'Build for the agentic era: build with AI, keep it secure and scale it beyond the demo.', 2, 1),
('bb1-gdg', 'daily', 'DevFest Jos', 'GDG stands for Google Developer Groups.', 'What does GDG stand for?',
  '["Google Data Gateway", "Global Design Guild", "Great Dev Gathering", "Google Developer Groups"]', 3, 'Google Developer Groups: community-run developer groups in cities around the world.', 3, 1),
('bb1-tracks', 'daily', 'DevFest Jos', 'DevFest Jos 2026 has five tracks.', 'How many tracks does DevFest Jos 2026 have?',
  '["3", "4", "5", "7"]', 2, 'Five: AI & Agents, Mobile, Web, Cloud & Security, and Product & Career.', 4, 1),
('bb1-gemini', 'daily', 'Google', 'Gemini is Google''s family of AI models.', 'What is Gemini?',
  '["A new Android phone", "Google''s family of AI models", "A Chrome extension store", "A Google Maps feature"]', 1, 'Gemini is Google''s family of multimodal AI models.', 5, 1),
('bb1-dart', 'daily', 'Google', 'Flutter apps are written in Dart.', 'Flutter apps are written in which language?',
  '["Dart", "Swift", "Kotlin", "Go"]', 0, 'Flutter uses Dart, also made by Google.', 6, 1),
('bb1-studio', 'daily', 'Google', 'Android Studio is the official IDE for Android apps.', 'What is the official tool (IDE) for building Android apps?',
  '["Xcode", "Visual Studio", "Notepad", "Android Studio"]', 3, 'Android Studio is Google''s official IDE for Android.', 7, 1),
('bb1-go', 'daily', 'Google', 'The Go programming language was created at Google.', 'Which programming language was created at Google?',
  '["Ruby", "Go", "Swift", "PHP"]', 1, 'Go was designed at Google and released in 2009.', 8, 1),
('bb1-aistudio', 'daily', 'Google', 'Google AI Studio lets you try Gemini models and get an API key.', 'Where can you try Gemini models and get a free API key?',
  '["Google Sheets", "YouTube Studio", "Google AI Studio", "Google Play Store"]', 2, 'Google AI Studio is the quickest way to prototype with Gemini.', 9, 1),

-- Round 2
('bb2-host', 'daily', 'DevFest Jos', 'DevFest Jos is hosted by GDG Jos.', 'Who hosts DevFest Jos?',
  '["A film studio", "GDG Jos", "A bank", "A TV station"]', 1, 'Google Developer Groups Jos, run by community volunteers.', 0, 2),
('bb2-notrack', 'daily', 'DevFest Jos', 'The five tracks are AI & Agents, Mobile, Web, Cloud & Security, and Product & Career.', 'Which of these is NOT a DevFest Jos 2026 track?',
  '["AI & Agents", "Mobile", "Product & Career", "Blockchain"]', 3, 'The tracks are AI & Agents, Mobile, Web, Cloud & Security, and Product & Career.', 1, 2),
('bb2-2025', 'daily', 'DevFest Jos', 'DevFest Jos 2025 had over 1,000 attendees.', 'Roughly how many people attended DevFest Jos 2025?',
  '["50+", "200+", "1,000+", "10,000+"]', 2, '1,000+ attendees, 17 speakers and 5 tracks.', 2, 2),
('bb2-padi', 'daily', 'DevFest Jos', 'In Padi Up you scan another player''s QR and you both score.', 'In the DevFest Quest Padi Up stage, how do you score?',
  '["Scan another player''s QR, and you both score", "Post a selfie", "Answer a riddle", "Buy a ticket"]', 0, 'Scan a player and you each get +20.', 3, 2),
('bb2-x', 'daily', 'DevFest Jos', 'GDG Jos is @gdgjos2 on X.', 'What is GDG Jos''s handle on X (Twitter)?',
  '["@devfest", "@gdgjos2", "@googlejos", "@plateautech"]', 1, 'Follow @gdgjos2 for DevFest Jos updates.', 4, 2),
('bb2-kotlin', 'daily', 'Google', 'Google recommends Kotlin for new Android apps.', 'Which language does Google recommend for new Android apps?',
  '["PHP", "Objective-C", "Java ME", "Kotlin"]', 3, 'Android has been Kotlin-first since 2019.', 5, 2),
('bb2-compose', 'daily', 'Google', 'Jetpack Compose is Android''s modern toolkit for building UI.', 'What is Jetpack Compose used for?',
  '["Writing music", "Building Android app screens (UI)", "Compressing photos", "Sending emails"]', 1, 'Compose builds native Android UI with Kotlin code.', 6, 2),
('bb2-firebase', 'daily', 'Google', 'Firebase gives apps sign-in, databases and hosting without managing servers.', 'Which Google platform gives your app sign-in, a database and hosting without running your own servers?',
  '["Firebase", "Google Fonts", "Google Lens", "Google Translate"]', 0, 'Firebase: Authentication, Firestore, Hosting and more.', 7, 2),
('bb2-angular', 'daily', 'Google', 'Angular is a web framework maintained by Google.', 'Which web framework is maintained by Google?',
  '["Laravel", "Django", "Angular", "Rails"]', 2, 'Angular is built and maintained by a team at Google.', 8, 2),
('bb2-devtools', 'daily', 'Google', 'Chrome DevTools lets you inspect a page''s HTML, CSS and network requests.', 'In Chrome, what do you open to inspect a page''s HTML, CSS and network requests?',
  '["Incognito mode", "DevTools", "Bookmarks", "Chrome Web Store"]', 1, 'Chrome DevTools: right-click and Inspect, or F12.', 9, 2),

-- Round 3
('bb3-manji', 'daily', 'DevFest Jos', 'Keynote speaker Manji Wilson is Chief Technical Adviser to the Governor of Plateau State.', 'Keynote speaker Manji Wilson is Chief Technical Adviser to whom?',
  '["The Governor of Plateau State", "The President of Nigeria", "The CEO of Google", "The UniJos Vice-Chancellor"]', 0, 'Chief Technical Adviser to the Governor of Plateau State.', 0, 3),
('bb3-cloudrun', 'daily', 'DevFest Jos', 'Umar Faruq Zubairu''s talk builds USSD and voice workflows with FastAPI and Cloud Run.', 'Umar Faruq Zubairu''s talk runs USSD and voice workflows on which Google Cloud service?',
  '["Google Drive", "Google Keep", "Blogger", "Cloud Run"]', 3, 'Cloud Run runs your containers and scales them for you.', 1, 3),
('bb3-adk', 'daily', 'DevFest Jos', 'ADK is Google''s Agent Development Kit.', 'Tejas Patel''s talk builds Gemini agents with Google ADK. What does ADK stand for?',
  '["Android Design Kit", "Agent Development Kit", "App Data Key", "Auto Deploy Kit"]', 1, 'Agent Development Kit: Google''s open-source framework for building agents.', 2, 3),
('bb3-mcp', 'daily', 'DevFest Jos', 'MCP stands for Model Context Protocol.', 'In AI agents, what does MCP stand for?',
  '["Mobile Cloud Platform", "Machine Code Parser", "Model Context Protocol", "Main Control Panel"]', 2, 'Model Context Protocol: a standard way to connect AI models to tools and data.', 3, 3),
('bb3-mypadi', 'daily', 'DevFest Jos', 'The My Padi ticket is two VIP tickets for you and a friend.', 'What is the My Padi ticket?',
  '["A ticket for kids", "Two VIP tickets for you and a friend", "A free online pass", "A speaker pass"]', 1, 'Two VIP tickets, a swag pack each and lunch for two.', 4, 3),
('bb3-gde', 'daily', 'Google', 'GDE stands for Google Developer Expert.', 'What is a GDE?',
  '["Global Data Engineer", "Google Drive Editor", "General Design Expert", "Google Developer Expert"]', 3, 'Google Developer Experts are recognised experts who share what they know.', 5, 3),
('bb3-vertex', 'daily', 'Google', 'Vertex AI is Google Cloud''s platform for building and deploying AI.', 'Vertex AI is Google Cloud''s platform for what?',
  '["Building and deploying AI models", "Booking flights", "Editing videos", "Making phone calls"]', 0, 'Vertex AI: train, tune and deploy models, including Gemini.', 6, 3),
('bb3-firestore', 'daily', 'Google', 'Cloud Firestore is a NoSQL document database.', 'What kind of database is Cloud Firestore?',
  '["A spreadsheet", "A NoSQL document database", "A paper filing system", "A video library"]', 1, 'Firestore stores data as documents in collections.', 7, 3),
('bb3-gemma', 'daily', 'Google', 'Gemma is Google''s family of open AI models.', 'What is Gemma?',
  '["A Google phone", "A payment app", "Google''s family of open AI models", "A font"]', 2, 'Gemma models are open, so you can run them on your own machine.', 8, 3),
('bb3-wtm', 'daily', 'Google', 'Women Techmakers is a Google program supporting women in tech.', 'What is Women Techmakers?',
  '["A Google program supporting women in tech", "A laptop brand", "An Android phone", "A coding language"]', 0, 'Women Techmakers builds visibility, community and resources for women in tech.', 9, 3)
on conflict (slug) do update set
  question = excluded.question, learn = excluded.learn, options = excluded.options, correct = excluded.correct,
  explanation = excluded.explanation, sort = excluded.sort, quiz_round = excluded.quiz_round;
