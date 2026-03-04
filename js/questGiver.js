// ===================================
// QUEST GIVER SYSTEM
// NPC Bird that gives quests and quizzes
// ===================================

class QuestGiver {
    constructor() {
        this.questDatabase = this.initializeQuests();
        this.quizDatabase = this.initializeQuizzes();
        this.activeQuest = null;
        // Load last quest time from localStorage
        const stored = localStorage.getItem('lastQuestGiverTimestamp');
        this.lastQuestTime = stored ? parseInt(stored, 10) : null;
        this.questCooldown = 300000; // 5 minutes in milliseconds
        this.questHeroAnimationInterval = null;
        this.questCrowAnimationInterval = null;
    }

    // Initialize quest database
    initializeQuests() {
        return [
            // Physical/Exercise Quests
            { id: 'q1', text: 'Do 10 jumping jacks', category: 'Exercise', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q2', text: 'Take a 10-minute walk outside', category: 'Exercise', difficulty: 'Easy', xp: 20, duration: 24 },
            { id: 'q3', text: 'Stretch for 5 minutes', category: 'Exercise', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q4', text: 'Do 15 push-ups (or modified push-ups)', category: 'Exercise', difficulty: 'Medium', xp: 25, duration: 24 },
            { id: 'q5', text: 'Hold a plank for 30 seconds', category: 'Exercise', difficulty: 'Medium', xp: 20, duration: 24 },
            
            // Creative Quests
            { id: 'q6', text: 'Draw or doodle for 10 minutes', category: 'Creative', difficulty: 'Easy', xp: 15, duration: 48 },
            { id: 'q7', text: 'Write a short poem or haiku', category: 'Creative', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q8', text: 'Take 5 creative photos', category: 'Creative', difficulty: 'Easy', xp: 20, duration: 48 },
            { id: 'q9', text: 'Create a playlist of 10 songs', category: 'Creative', difficulty: 'Easy', xp: 15, duration: 48 },
            { id: 'q10', text: 'Build something with household items', category: 'Creative', difficulty: 'Medium', xp: 30, duration: 48 },
            
            // Learning Quests
            { id: 'q11', text: 'Learn 5 new words in another language', category: 'Learning', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q12', text: 'Read for 20 minutes', category: 'Learning', difficulty: 'Easy', xp: 20, duration: 24 },
            { id: 'q13', text: 'Watch an educational video', category: 'Learning', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q14', text: 'Practice a musical instrument for 15 minutes', category: 'Learning', difficulty: 'Medium', xp: 25, duration: 24 },
            { id: 'q15', text: 'Solve 5 math or logic puzzles', category: 'Learning', difficulty: 'Medium', xp: 30, duration: 48 },
            
            // Social/Kindness Quests
            { id: 'q16', text: 'Call or message a friend you haven\'t talked to in a while', category: 'Social', difficulty: 'Easy', xp: 20, duration: 48 },
            { id: 'q17', text: 'Give someone a genuine compliment', category: 'Social', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q18', text: 'Help someone with a task', category: 'Social', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q19', text: 'Write a thank you note to someone', category: 'Social', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q20', text: 'Share something you learned today', category: 'Social', difficulty: 'Easy', xp: 15, duration: 24 },
            
            // Self-Care Quests
            { id: 'q21', text: 'Drink 8 glasses of water today', category: 'Self-Care', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q22', text: 'Meditate or practice deep breathing for 5 minutes', category: 'Self-Care', difficulty: 'Easy', xp: 20, duration: 24 },
            { id: 'q23', text: 'Organize one small area of your space', category: 'Self-Care', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q24', text: 'Go to bed 30 minutes earlier tonight', category: 'Self-Care', difficulty: 'Medium', xp: 20, duration: 24 },
            { id: 'q25', text: 'Spend 10 minutes in nature', category: 'Self-Care', difficulty: 'Easy', xp: 20, duration: 24 },
            
            // Fun/Adventure Quests
            { id: 'q26', text: 'Try a new recipe or food', category: 'Adventure', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q27', text: 'Explore a new place in your neighborhood', category: 'Adventure', difficulty: 'Medium', xp: 30, duration: 48 },
            { id: 'q28', text: 'Learn a new skill from a YouTube tutorial', category: 'Adventure', difficulty: 'Medium', xp: 30, duration: 72 },
            { id: 'q29', text: 'Play a board game or card game', category: 'Adventure', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q30', text: 'Start a new hobby project', category: 'Adventure', difficulty: 'Hard', xp: 40, duration: 72 },
            
            // Productivity Quests
            { id: 'q31', text: 'Make a to-do list for tomorrow', category: 'Productivity', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q32', text: 'Complete one task you\'ve been putting off', category: 'Productivity', difficulty: 'Medium', xp: 30, duration: 48 },
            { id: 'q33', text: 'Spend 15 minutes decluttering', category: 'Productivity', difficulty: 'Easy', xp: 20, duration: 24 },
            { id: 'q34', text: 'Review and update your goals', category: 'Productivity', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q35', text: 'Plan your meals for the next 3 days', category: 'Productivity', difficulty: 'Medium', xp: 25, duration: 48 },
            
            // Work/Office Quests
            { id: 'q36', text: 'Organize your desk or workspace', category: 'Work', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q37', text: 'Send a thank you email to a colleague', category: 'Work', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q38', text: 'Take a 5-minute break to stretch at your desk', category: 'Work', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q39', text: 'Update your calendar for the week ahead', category: 'Work', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q40', text: 'Clear out 10 old emails from your inbox', category: 'Work', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q41', text: 'Review and prioritize your task list', category: 'Work', difficulty: 'Medium', xp: 20, duration: 24 },
            { id: 'q42', text: 'Attend a meeting fully prepared with notes', category: 'Work', difficulty: 'Medium', xp: 25, duration: 48 },
            
            // School/Study Quests
            { id: 'q43', text: 'Review your class notes for 15 minutes', category: 'School', difficulty: 'Easy', xp: 20, duration: 24 },
            { id: 'q44', text: 'Organize your study materials or backpack', category: 'School', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q45', text: 'Complete one homework assignment early', category: 'School', difficulty: 'Medium', xp: 30, duration: 48 },
            { id: 'q46', text: 'Create flashcards for an upcoming test', category: 'School', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q47', text: 'Ask a question in class or office hours', category: 'School', difficulty: 'Medium', xp: 20, duration: 24 },
            { id: 'q48', text: 'Study with a classmate or study group', category: 'School', difficulty: 'Medium', xp: 25, duration: 48 },
            
            // Gym/Fitness Quests
            { id: 'q49', text: 'Do a 10-minute warm-up before your workout', category: 'Fitness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q50', text: 'Try a new exercise or machine at the gym', category: 'Fitness', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q51', text: 'Complete a full workout session', category: 'Fitness', difficulty: 'Medium', xp: 30, duration: 24 },
            { id: 'q52', text: 'Do 20 squats during a break', category: 'Fitness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q53', text: 'Stretch for 10 minutes after exercise', category: 'Fitness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q54', text: 'Track your workout progress in a journal', category: 'Fitness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q55', text: 'Increase weight or reps on one exercise', category: 'Fitness', difficulty: 'Medium', xp: 25, duration: 48 },
            
            // Sad Mood Quest Pack - Calming, self-care, mindfulness
            { id: 'q56', text: 'Take three slow breaths', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q57', text: 'Drink a full glass of water', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q58', text: 'Stretch your shoulders or neck', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q59', text: 'Write one thing you\'re grateful for', category: 'Mindfulness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q60', text: 'Doodle or scribble anything', category: 'Creative', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q61', text: 'Step outside or open a window for fresh air', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q62', text: 'Sit quietly for one minute and breathe', category: 'Grounding', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q63', text: 'Listen to a song that soothes you', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q64', text: 'Tidy one small area (desk, cup, corner)', category: 'Self-Care', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q65', text: 'Notice three things around you right now', category: 'Grounding', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q66', text: 'Write a kind thought toward yourself', category: 'Mindfulness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q67', text: 'Close your eyes and feel your heartbeat', category: 'Grounding', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q68', text: 'Imagine a calm place and picture yourself there', category: 'Mindfulness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q69', text: 'Wash your face or hands with warm water', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q70', text: 'Smile at your Task Monster', category: 'Creative', difficulty: 'Easy', xp: 10, duration: 24 },

            // NEW QUESTS - Universal Low-Friction Tasks (q71-q90)
            { id: 'q71', text: 'Take 5 minutes to clean your phone screen', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q72', text: 'Sort one small folder on your computer or device', category: 'Productivity', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q73', text: 'Write down one clear goal for tomorrow', category: 'Productivity', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q74', text: 'Spend 3 minutes listing things you are grateful for', category: 'Mindfulness', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q75', text: 'Unsubscribe from one email list you never read', category: 'Digital-Clean', difficulty: 'Easy', xp: 20, duration: 24 },
            { id: 'q76', text: 'Delete 5 unnecessary photos or screenshots from your phone', category: 'Digital-Clean', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q77', text: 'Turn off notifications for one distracting app', category: 'Self-Care', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q78', text: 'Organize the icons on your phone\'s home screen', category: 'Digital-Clean', difficulty: 'Medium', xp: 20, duration: 48 },
            { id: 'q79', text: 'Spend 2 minutes focusing only on your breathing', category: 'Mindfulness', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q80', text: 'Write a positive note or affirmation to yourself', category: 'Mindfulness', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q81', text: 'Organize one drawer, shelf, or small space in your home', category: 'Self-Care', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q82', text: 'Choose one task on your to-do list and break it into 3 smaller steps', category: 'Productivity', difficulty: 'Medium', xp: 20, duration: 48 },
            { id: 'q83', text: 'Write a short journal entry about how your day went', category: 'Creative', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q84', text: 'Find a quote that inspires you and save or write it down', category: 'Creative', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q85', text: 'Spend 5 minutes sitting quietly with no screens', category: 'Self-Care', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q86', text: 'Change one important password to something more secure', category: 'Digital-Clean', difficulty: 'Medium', xp: 25, duration: 48 },
            { id: 'q87', text: 'Reply to one message or email you have been avoiding', category: 'Productivity', difficulty: 'Medium', xp: 20, duration: 48 },
            { id: 'q88', text: 'Make a simple list of three things you want to improve this week', category: 'Productivity', difficulty: 'Easy', xp: 15, duration: 24 },
            { id: 'q89', text: 'Prepare a glass of water and drink it slowly and mindfully', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 },
            { id: 'q90', text: 'Step away from all screens for 60 seconds and look around your space', category: 'Self-Care', difficulty: 'Easy', xp: 10, duration: 24 }
        ];
    }

    // Initialize quiz database
    initializeQuizzes() {
        return [
            // Science Facts
            { id: 'quiz1', question: 'What is the largest planet in our solar system?', options: ['Earth', 'Jupiter', 'Saturn', 'Mars'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz2', question: 'How many bones does an adult human have?', options: ['186', '206', '226', '246'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz3', question: 'What is the speed of light?', options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correct: 0, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz4', question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz5', question: 'How long does it take for light from the Sun to reach Earth?', options: ['8 seconds', '8 minutes', '8 hours', '8 days'], correct: 1, xpReward: 20, xpPenalty: 10 },
            
            // Geography Facts
            { id: 'quiz6', question: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz7', question: 'Which ocean is the largest?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz8', question: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz9', question: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz10', question: 'Which country has the most time zones?', options: ['USA', 'Russia', 'China', 'France'], correct: 3, xpReward: 20, xpPenalty: 10 },
            
            // History Facts
            { id: 'quiz11', question: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz12', question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz13', question: 'What year did the first iPhone release?', options: ['2005', '2006', '2007', '2008'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz14', question: 'Who was the first person to walk on the moon?', options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz15', question: 'In what year did the Berlin Wall fall?', options: ['1987', '1988', '1989', '1990'], correct: 2, xpReward: 15, xpPenalty: 10 },
            
            // Animal Facts
            { id: 'quiz16', question: 'What is the fastest land animal?', options: ['Lion', 'Cheetah', 'Leopard', 'Gazelle'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz17', question: 'How many hearts does an octopus have?', options: ['1', '2', '3', '4'], correct: 2, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz18', question: 'What is the largest mammal?', options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz19', question: 'How long can a snail sleep?', options: ['1 week', '1 month', '3 months', '3 years'], correct: 3, xpReward: 25, xpPenalty: 15 },
            { id: 'quiz20', question: 'What animal can hold its breath the longest?', options: ['Whale', 'Dolphin', 'Sea Turtle', 'Cuvier\'s Beaked Whale'], correct: 3, xpReward: 25, xpPenalty: 15 },
            
            // General Knowledge
            { id: 'quiz21', question: 'How many days are in a leap year?', options: ['364', '365', '366', '367'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz22', question: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz23', question: 'How many strings does a standard guitar have?', options: ['4', '5', '6', '7'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz24', question: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Titanium'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz25', question: 'How many colors are in a rainbow?', options: ['5', '6', '7', '8'], correct: 2, xpReward: 10, xpPenalty: 5 },
            
            // Technology Facts
            { id: 'quiz26', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correct: 0, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz27', question: 'Who is known as the father of computers?', options: ['Bill Gates', 'Steve Jobs', 'Charles Babbage', 'Alan Turing'], correct: 2, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz28', question: 'What year was Google founded?', options: ['1996', '1998', '2000', '2002'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz29', question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'HyperText Transmission Process', 'Home Tool Transfer Protocol'], correct: 0, xpReward: 15, xpPenalty: 10 },
            
            // Space & Astronomy Facts
            { id: 'quiz30', question: 'How many moons does Mars have?', options: ['0', '1', '2', '4'], correct: 2, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz31', question: 'What is the closest star to Earth?', options: ['Alpha Centauri', 'Sirius', 'The Sun', 'Proxima Centauri'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz32', question: 'How long does it take for the Moon to orbit Earth?', options: ['24 hours', '7 days', '27.3 days', '365 days'], correct: 2, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz33', question: 'What is the hottest planet in our solar system?', options: ['Mercury', 'Venus', 'Mars', 'Jupiter'], correct: 1, xpReward: 15, xpPenalty: 10 },
            
            // Human Body Facts
            { id: 'quiz34', question: 'What is the largest organ in the human body?', options: ['Heart', 'Liver', 'Skin', 'Brain'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz35', question: 'How many teeth does an adult human have?', options: ['28', '30', '32', '34'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz36', question: 'What is the smallest bone in the human body?', options: ['Stapes (in ear)', 'Finger bone', 'Toe bone', 'Nose bone'], correct: 0, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz37', question: 'How many chambers does the human heart have?', options: ['2', '3', '4', '5'], correct: 2, xpReward: 15, xpPenalty: 10 },
            
            // Mathematics Facts
            { id: 'quiz38', question: 'What is the value of Pi (π) to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz39', question: 'What is 12 squared?', options: ['124', '132', '144', '156'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz40', question: 'How many degrees are in a circle?', options: ['180', '270', '360', '450'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz41', question: 'What is the sum of angles in a triangle?', options: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'], correct: 1, xpReward: 15, xpPenalty: 10 },
            
            // World Records & Facts
            { id: 'quiz42', question: 'What is the tallest mountain in the world?', options: ['K2', 'Mount Kilimanjaro', 'Mount Everest', 'Denali'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz43', question: 'What is the deepest ocean trench?', options: ['Mariana Trench', 'Puerto Rico Trench', 'Java Trench', 'Philippine Trench'], correct: 0, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz44', question: 'What is the largest desert in the world?', options: ['Sahara', 'Arabian', 'Gobi', 'Antarctic'], correct: 3, xpReward: 25, xpPenalty: 15 },
            { id: 'quiz45', question: 'How many elements are in the periodic table?', options: ['92', '108', '118', '126'], correct: 2, xpReward: 20, xpPenalty: 10 },
            
            // NEW QUIZZES - Literature & Arts
            { id: 'quiz46', question: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz47', question: 'What is the most spoken language in the world by native speakers?', options: ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz48', question: 'In which city is the Louvre Museum located?', options: ['London', 'Rome', 'Paris', 'Madrid'], correct: 2, xpReward: 10, xpPenalty: 5 },
            
            // NEW QUIZZES - Nature & Environment
            { id: 'quiz49', question: 'What percentage of Earth\'s surface is covered by water?', options: ['50%', '61%', '71%', '81%'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz50', question: 'How many legs does a spider have?', options: ['6', '8', '10', '12'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz51', question: 'What gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2, xpReward: 10, xpPenalty: 5 },
            
            // NEW QUIZZES - Sports & Entertainment
            { id: 'quiz52', question: 'How many players are on a soccer team on the field?', options: ['9', '10', '11', '12'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz53', question: 'In which year were the first modern Olympic Games held?', options: ['1892', '1896', '1900', '1904'], correct: 1, xpReward: 20, xpPenalty: 10 },
            
            // NEW QUIZZES - Food & Culture
            { id: 'quiz54', question: 'What is the main ingredient in traditional Japanese miso soup?', options: ['Tofu', 'Seaweed', 'Fermented soybean paste', 'Rice'], correct: 2, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz55', question: 'Which country is the largest producer of coffee in the world?', options: ['Colombia', 'Vietnam', 'Brazil', 'Ethiopia'], correct: 2, xpReward: 15, xpPenalty: 10 },

            // NEW QUIZZES - Science & Nature (quiz56-quiz65)
            { id: 'quiz56', question: 'Which layer of the atmosphere is closest to Earth\'s surface?', options: ['Stratosphere', 'Troposphere', 'Mesosphere', 'Thermosphere'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz57', question: 'What do bees collect from flowers to make honey?', options: ['Water', 'Sap', 'Nectar', 'Dust'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz58', question: 'Which scientist proposed the three laws of motion?', options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Niels Bohr'], correct: 1, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz59', question: 'What is the main gas plants release during photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'], correct: 0, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz60', question: 'What is the boiling point of water at sea level?', options: ['50°C', '75°C', '100°C', '150°C'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz61', question: 'Which blood type is known as the universal donor?', options: ['A+', 'O−', 'AB+', 'B−'], correct: 1, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz62', question: 'What part of the human eye controls the amount of light that enters?', options: ['Lens', 'Retina', 'Iris', 'Cornea'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz63', question: 'Which metal is most commonly used for electrical wiring?', options: ['Gold', 'Iron', 'Copper', 'Aluminum'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz64', question: 'Which vitamin is mainly found in citrus fruits like oranges?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz65', question: 'What is the hardest naturally occurring rock?', options: ['Granite', 'Obsidian', 'Diamond', 'Quartzite'], correct: 2, xpReward: 15, xpPenalty: 10 },

            // NEW QUIZZES - Geography (quiz66-quiz75)
            { id: 'quiz66', question: 'What is the capital of Japan?', options: ['Osaka', 'Kyoto', 'Tokyo', 'Sapporo'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz67', question: 'Which country is famous for the landmark Christ the Redeemer?', options: ['Spain', 'Brazil', 'Portugal', 'Mexico'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz68', question: 'Which US state is known as "The Sunshine State"?', options: ['California', 'Florida', 'Arizona', 'Texas'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz69', question: 'Which city is known as the "Big Apple"?', options: ['Los Angeles', 'Chicago', 'New York City', 'Boston'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz70', question: 'Which continent is the driest on Earth?', options: ['Africa', 'Antarctica', 'Australia', 'Asia'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz71', question: 'Which country is home to the ancient city of Petra?', options: ['Egypt', 'Jordan', 'Greece', 'Turkey'], correct: 1, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz72', question: 'Which river flows through the city of London?', options: ['Seine', 'Thames', 'Danube', 'Rhine'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz73', question: 'What is the capital of Canada?', options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz74', question: 'Which country is known for the Taj Mahal?', options: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka'], correct: 0, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz75', question: 'Which continent is home to the Amazon rainforest?', options: ['Africa', 'Asia', 'South America', 'Australia'], correct: 2, xpReward: 10, xpPenalty: 5 },

            // NEW QUIZZES - History (quiz76-quiz80)
            { id: 'quiz76', question: 'In which year did humans first land on the Moon?', options: ['1965', '1969', '1972', '1975'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz77', question: 'Who was the first President of the United States?', options: ['George Washington', 'Thomas Jefferson', 'John Adams', 'James Madison'], correct: 0, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz78', question: 'Who is credited with inventing the printing press in Europe?', options: ['Johannes Gutenberg', 'Leonardo da Vinci', 'Galileo Galilei', 'Martin Luther'], correct: 0, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz79', question: 'Which ancient civilization built the pyramids at Giza?', options: ['Greek', 'Roman', 'Egyptian', 'Persian'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz80', question: 'What event started on October 29, 1929, known as "Black Tuesday"?', options: ['World War I', 'The Great Depression', 'World War II', 'The Cold War'], correct: 1, xpReward: 20, xpPenalty: 10 },

            // NEW QUIZZES - Arts & Culture (quiz81-quiz85)
            { id: 'quiz81', question: 'Who wrote the novel "Pride and Prejudice"?', options: ['Jane Austen', 'Charlotte Brontë', 'Emily Dickinson', 'Mary Shelley'], correct: 0, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz82', question: 'Which artist is famous for cutting off part of his own ear?', options: ['Pablo Picasso', 'Vincent van Gogh', 'Claude Monet', 'Salvador Dalí'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz83', question: 'In music, how many notes are in a standard major scale?', options: ['5', '6', '7', '8'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz84', question: 'Which Shakespeare play features the characters Rosencrantz and Guildenstern?', options: ['Hamlet', 'Macbeth', 'Othello', 'King Lear'], correct: 0, xpReward: 20, xpPenalty: 10 },
            { id: 'quiz85', question: 'What is the term for a painting done directly on a wall or ceiling?', options: ['Fresco', 'Mosaic', 'Etching', 'Relief'], correct: 0, xpReward: 15, xpPenalty: 10 },

            // NEW QUIZZES - Technology (quiz86-quiz90)
            { id: 'quiz86', question: 'What does "URL" stand for?', options: ['Universal Record Link', 'Uniform Resource Locator', 'Unified Routing List', 'Universal Routing Locator'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz87', question: 'Which company created the Windows operating system?', options: ['Apple', 'Microsoft', 'IBM', 'Google'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz88', question: 'What does "AI" stand for in computing?', options: ['Automated Input', 'Artificial Intelligence', 'Advanced Interface', 'Automated Internet'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz89', question: 'Which social media platform is represented by a blue bird logo?', options: ['Instagram', 'Twitter/X', 'TikTok', 'Snapchat'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz90', question: 'What device is used to input handwritten or drawn content onto a computer screen?', options: ['Mouse', 'Keyboard', 'Graphics tablet', 'Joystick'], correct: 2, xpReward: 15, xpPenalty: 10 },

            // NEW QUIZZES - Space & Physics (quiz91-quiz95)
            { id: 'quiz91', question: 'Which planet is known for its prominent ring system?', options: ['Mars', 'Venus', 'Saturn', 'Mercury'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz92', question: 'What is a group of stars that forms a pattern called?', options: ['Galaxy', 'Nebula', 'Constellation', 'Cluster'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz93', question: 'Which planet is sometimes called Earth\'s twin due to its similar size?', options: ['Venus', 'Mars', 'Mercury', 'Neptune'], correct: 0, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz94', question: 'What is the name of our galaxy?', options: ['Andromeda', 'Whirlpool Galaxy', 'Milky Way', 'Sombrero Galaxy'], correct: 2, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz95', question: 'What phenomenon causes the apparent bending of light as it passes through water?', options: ['Reflection', 'Refraction', 'Diffraction', 'Absorption'], correct: 1, xpReward: 15, xpPenalty: 10 },

            // NEW QUIZZES - Human Body (quiz96-quiz100)
            { id: 'quiz96', question: 'Which organ in the human body is primarily responsible for detoxifying chemicals?', options: ['Heart', 'Liver', 'Lungs', 'Kidneys'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz97', question: 'What is the normal human body temperature in Celsius?', options: ['34°C', '36.5–37°C', '39°C', '41°C'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz98', question: 'What is the largest joint in the human body?', options: ['Shoulder', 'Knee', 'Elbow', 'Hip'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz99', question: 'Which sense is associated with the olfactory nerve?', options: ['Sight', 'Hearing', 'Smell', 'Taste'], correct: 2, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz100', question: 'Which part of the nervous system is made up of the brain and spinal cord?', options: ['Central nervous system', 'Peripheral nervous system', 'Autonomic nervous system', 'Somatic nervous system'], correct: 0, xpReward: 20, xpPenalty: 10 },

            // NEW QUIZZES - Food & Cuisine (quiz101-quiz105)
            { id: 'quiz101', question: 'What is the main ingredient in guacamole?', options: ['Tomato', 'Avocado', 'Cucumber', 'Peas'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz102', question: 'Sushi originates from which country?', options: ['China', 'Japan', 'Korea', 'Thailand'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz103', question: 'Which grain is traditionally used to make risotto?', options: ['Basmati rice', 'Arborio rice', 'Jasmine rice', 'Brown rice'], correct: 1, xpReward: 15, xpPenalty: 10 },
            { id: 'quiz104', question: 'Which drink is made by fermenting grapes?', options: ['Beer', 'Wine', 'Cider', 'Vodka'], correct: 1, xpReward: 10, xpPenalty: 5 },
            { id: 'quiz105', question: 'Which country is famous for originating pizza as we know it today?', options: ['France', 'Italy', 'Germany', 'United Kingdom'], correct: 1, xpReward: 10, xpPenalty: 5 }
        ];
    }

    // Check if quest giver should appear
    shouldAppear() {
        if (!this.lastQuestTime) {
            return true; // First time
        }
        const timeSinceLastQuest = Date.now() - this.lastQuestTime;
        return timeSinceLastQuest >= this.questCooldown;
    }

    // Get random quest
    getRandomQuest() {
        const randomIndex = Math.floor(Math.random() * this.questDatabase.length);
        const quest = { ...this.questDatabase[randomIndex] };
        quest.deadline = Date.now() + (quest.duration * 3600000); // Convert hours to milliseconds
        quest.type = 'quest';
        return quest;
    }

    // Get random quiz
    getRandomQuiz() {
        const randomIndex = Math.floor(Math.random() * this.quizDatabase.length);
        return { ...this.quizDatabase[randomIndex], type: 'quiz' };
    }

    // Randomly choose between quest or quiz
    getRandomEncounter() {
        const isQuiz = Math.random() < 0.3; // 30% chance of quiz, 70% chance of quest
        return isQuiz ? this.getRandomQuiz() : this.getRandomQuest();
    }

    // Show quest giver UI
    show() {
        // CRITICAL: Prevent quest giver from appearing during battle
        if (window.battleManager && window.battleManager.inBattle) {

            return;
        }
        
        // Check if quest giver onboarding should be shown first
        if (window.questGiverOnboarding && window.QuestGiverOnboarding && window.QuestGiverOnboarding.shouldShow()) {

            window.questGiverOnboarding.start();
            
            // After onboarding completes, show quest giver
            // We'll use a polling mechanism to wait for completion
            const checkCompletion = setInterval(() => {
                if (localStorage.getItem('questGiverOnboardingCompleted') === 'true') {
                    clearInterval(checkCompletion);

                    this.showAfterOnboarding();
                }
            }, 100);
            return;
        }
        
        this.showAfterOnboarding();
    }
    
    // Show quest giver after onboarding (or skip if already completed)
    showAfterOnboarding() {
        // CRITICAL: Prevent quest giver from appearing during battle
        if (window.battleManager && window.battleManager.inBattle) {

            return;
        }
        
        // FIX: Prevent duplicate quest giver triggers
        if (this.activeQuest) {

            return;
        }
        
        this.lastQuestTime = Date.now();
        // Save to localStorage for persistence
        localStorage.setItem('lastQuestGiverTimestamp', this.lastQuestTime.toString());
        const encounter = this.getRandomEncounter();
        this.activeQuest = encounter;
        
        // Track quest offered (only for quests, not quizzes)
        if (encounter.type === 'quest' && window.gameState) {
            window.gameState.questTasksOffered = (window.gameState.questTasksOffered || 0) + 1;
            if (typeof window.saveGameState === 'function') {
                window.saveGameState();
            }
        }
        
        // Skip modal - go straight to quest/quiz
        this.showQuestGiverDirect();
    }
    
    // Show quest giver directly (after modal Yes or fallback)
    showQuestGiverDirect() {
        // CRITICAL: Ensure main app UI is visible before showing quest giver
        // This prevents black screen when quest giver UI is displayed
        if (document.documentElement.style.visibility !== 'visible') {
            document.documentElement.style.visibility = 'visible';

        }
        
        const questGiverUI = document.getElementById('questGiverUI');
        if (!questGiverUI) {
            console.error('Quest Giver UI not found');
            return;
        }

        const encounter = this.activeQuest;
        if (!encounter) {
            console.error('No active encounter');
            return;
        }

        // Update UI based on type
        if (encounter.type === 'quest') {
            this.showQuestUI(encounter);
        } else {
            this.showQuizUI(encounter);
        }

        // Initialize sprite animations
        this.initCrowSprite();

        questGiverUI.classList.remove('hidden');
        
        // Play quest giver music only if UI is actually visible
        if (window.audioManager && !questGiverUI.classList.contains('hidden')) {
            // Small delay to ensure UI is rendered
            setTimeout(() => {
                if (!questGiverUI.classList.contains('hidden')) {

                    window.audioManager.playQuestMusic();
                }
            }, 100);
        }
    }

    // Show quest UI
    showQuestUI(quest) {
        const dialogueText = document.getElementById('questDialogue');
        const questActions = document.getElementById('questActions');
        const quizActions = document.getElementById('quizActions');

        // Wise, sage-like introductions
        const wiseSayings = [
            "Greetings, young traveler. I bring you a challenge worthy of your spirit.",
            "Ah, I see potential in you. Perhaps you are ready for this task.",
            "The forest whispers of your deeds. Will you accept another?",
            "Time flows like a river, and I have a quest that calls to you.",
            "Wisdom comes through action. I offer you this opportunity.",
            "The path to growth is paved with challenges. Here is yours."
        ];
        const randomSaying = wiseSayings[Math.floor(Math.random() * wiseSayings.length)];

        dialogueText.innerHTML = `
            <p class="quest-dialogue-text">"${randomSaying}"</p>
            <p class="quest-title">📜 Quest</p>
            <p class="quest-description">${quest.text}</p>
            <p class="quest-details">
                <span class="quest-category">${quest.category.toLowerCase()}</span>
                <span class="quest-difficulty">${quest.difficulty.toLowerCase()}</span>
            </p>
            <p class="quest-reward">⭐ Reward: ${quest.xp} XP</p>
            <p class="quest-deadline">⏰ Complete within ${quest.duration} hours</p>
        `;

        questActions.classList.remove('hidden');
        quizActions.classList.add('hidden');
    }

    // Show quiz UI
    showQuizUI(quiz) {
        const dialogueText = document.getElementById('questDialogue');
        const questActions = document.getElementById('questActions');
        const quizActions = document.getElementById('quizActions');

        // Wise quiz introductions
        const quizIntros = [
            "Test your knowledge, young one. Wisdom is earned through learning.",
            "The mind must be sharp as well as the spirit. Answer this riddle.",
            "Knowledge is power, they say. Let us see what you know.",
            "I have traveled far and learned much. Can you answer this?",
            "A curious mind is a growing mind. Ponder this question."
        ];
        const randomIntro = quizIntros[Math.floor(Math.random() * quizIntros.length)];

        dialogueText.innerHTML = `
            <p class="quest-dialogue-text">"${randomIntro}"</p>
            <p class="quest-title">🧠 Trivia Challenge</p>
            <p class="quiz-question">${quiz.question}</p>
        `;

        // Create quiz options
        const quizOptions = document.getElementById('quizOptions');
        quizOptions.innerHTML = '';
        quiz.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'quiz-option';
            button.textContent = option;
            button.onclick = () => this.answerQuiz(index);
            quizOptions.appendChild(button);
        });
        
        // Add pass button
        const passButton = document.createElement('button');
        passButton.className = 'quiz-pass-btn';
        passButton.textContent = 'Pass';
        passButton.onclick = () => this.passQuiz();
        quizOptions.appendChild(passButton);

        questActions.classList.add('hidden');
        quizActions.classList.remove('hidden');
    }

    // Accept quest
    acceptQuest() {
        if (!this.activeQuest || this.activeQuest.type !== 'quest') return;
        
        // Track quest acceptance
        if (window.gameState) {
            window.gameState.questTasksAccepted = (window.gameState.questTasksAccepted || 0) + 1;
            if (typeof window.saveGameState === 'function') {
                window.saveGameState();
            }
        }

        // Add quest to quest task manager (separate from regular tasks)
        if (window.questTaskManager) {
            window.questTaskManager.addQuestTask(this.activeQuest);
        } else {
            console.error('Quest Task Manager not found');
        }
        
        // Play quest accepted sound
        if (window.audioManager) {
            window.audioManager.playSound('quest_accepted', 0.8);
        }
        
        // Show confirmation
        const questName = this.activeQuest.text;
        const hours = this.activeQuest.duration;
        if (typeof showMessage === 'function') {
            showMessage(`✅ Quest accepted! "${questName}" - Complete within ${hours} hours for ${this.activeQuest.xp} XP!`);
        } else {
            alert(`✅ Quest accepted! "${questName}" - Complete within ${hours} hours for ${this.activeQuest.xp} XP!`);
        }

        this.close();
        
        // ENSURE MAIN APP UI IS ALWAYS VISIBLE after accepting quest
        // This fixes the black screen issue
        if (document.documentElement.style.visibility !== 'visible') {
            document.documentElement.style.visibility = 'visible';

        }
    }

    // Decline quest
    declineQuest() {
        this.close();
        alert('Quest declined. The crow flies away...');
    }

    // Answer quiz
    answerQuiz(selectedIndex) {
        if (!this.activeQuest || this.activeQuest.type !== 'quiz') return;

        const isCorrect = selectedIndex === this.activeQuest.correct;
        
        if (isCorrect) {
            // Award XP using the proper function
            if (!window.gameState) {
                console.error('window.gameState not found!');
                alert('⚠️ Error: Game not fully loaded. Please try again.');
                this.close();
                return;
            }
            
            // Track quiz passed
            window.gameState.questQuizzesPassed = (window.gameState.questQuizzesPassed || 0) + 1;
            
            // Track quiz perfect streak
            window.gameState.quizPerfectStreak = (window.gameState.quizPerfectStreak || 0) + 1;
            
            // Check achievements
            if (window.achievementTracker) {
                window.achievementTracker.checkAchievements();
            }
            
           if (typeof window.addJerryXP === 'function') {
                window.addJerryXP(this.activeQuest.xpReward);
            } else {
                console.error('addJerryXP function not found');
            }
            
            window.saveGameState();
            
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }
            
            // Play quiz won sound
            if (window.audioManager) {
                window.audioManager.playSound('quiz_won', 0.8);
            }
            
            alert(`✅ Correct! +${this.activeQuest.xpReward} XP`);
        } else {
            // Deduct XP
            if (!window.gameState) {
                console.error('window.gameState not found!');
                alert('⚠️ Error: Game not fully loaded. Please try again.');
                this.close();
                return;
            }
            
            // Track quiz failed
            window.gameState.questQuizzesFailed = (window.gameState.questQuizzesFailed || 0) + 1;
            
            // Reset quiz perfect streak on failure
            window.gameState.quizPerfectStreak = 0;
            
            if (typeof window.addJerryXP === 'function') {
                window.addJerryXP(-this.activeQuest.xpPenalty);
            } else {
                const oldXP = window.gameState.jerryXP || 0;
                window.gameState.jerryXP = Math.max(0, oldXP - this.activeQuest.xpPenalty);

            }
            
            if (typeof window.saveGameState === 'function') {
                window.saveGameState();
            }
            
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }
            
            const correctAnswer = this.activeQuest.options[this.activeQuest.correct];
            alert(`❌ Wrong! The correct answer was: ${correctAnswer}. -${this.activeQuest.xpPenalty} XP`);
        }

        this.close();
    }

    // Pass quiz (decline to answer)
    passQuiz() {
        // Reset quiz perfect streak when declining
        if (window.gameState) {
            window.gameState.quizPerfectStreak = 0;
        }
        
        this.close();
        if (typeof showMessage === 'function') {
            showMessage('Quiz declined. The crow flies away...');
        } else {
            alert('Quiz declined. The crow flies away...');
        }
    }

    // Update hero sprite to use selected monster with animation
    updateHeroSprite() {
        const heroSprite = document.getElementById('questHeroSprite');
        
        if (heroSprite) {
            // v3.56: Use getActiveHeroAppearance to respect equipped skins
            const appearance = window.getActiveHeroAppearance ? window.getActiveHeroAppearance() : null;
            if (appearance && appearance.animations && appearance.animations.idle) {
                heroSprite.src = appearance.animations.idle;
            } else {
                // Fallback to default monster GIF
                const monsterName = localStorage.getItem('selectedMonster') || 'nova';
                const monsterMap = { luna: 'Luna', benny: 'Benny', nova: 'Nova' };
                const monster = monsterMap[monsterName] || 'Nova';
                heroSprite.src = `assets/heroes/${monster}_idle.gif`;
            }
            heroSprite.style.backgroundImage = 'none';
            heroSprite.style.background = 'none';
            heroSprite.style.width = '32px';
            heroSprite.style.height = '32px';
            heroSprite.style.objectFit = 'contain';
            
            // Clear any existing animation interval (not needed for GIFs)
            if (this.questHeroAnimationInterval) {
                clearInterval(this.questHeroAnimationInterval);
                this.questHeroAnimationInterval = null;
            }
        }
    }

    // Initialize crow sprite animation
    initCrowSprite() {
        const crowSprite = document.getElementById('questCrowSprite');
        
        if (crowSprite) {
            // FIXED v3.55: Use GIF animation instead of PNG spritesheet
            crowSprite.src = 'assets/quest-giver/crow-idle-animated.gif';
            crowSprite.style.backgroundImage = 'none'; // Clear any background
            crowSprite.style.width = '48px';
            crowSprite.style.height = '48px';
            crowSprite.style.objectFit = 'contain';
            
            // Clear any existing animation interval (not needed for GIFs)
            if (this.questCrowAnimationInterval) {
                clearInterval(this.questCrowAnimationInterval);
                this.questCrowAnimationInterval = null;
            }
        }
    }

    // Close quest giver UI
    close() {
        // Clear animation intervals
        if (this.questHeroAnimationInterval) {
            clearInterval(this.questHeroAnimationInterval);
            this.questHeroAnimationInterval = null;
        }
        if (this.questCrowAnimationInterval) {
            clearInterval(this.questCrowAnimationInterval);
            this.questCrowAnimationInterval = null;
        }
        
        const questGiverUI = document.getElementById('questGiverUI');
        if (questGiverUI) {
            questGiverUI.classList.add('hidden');
        }
        
        // Stop quest music
        if (window.audioManager) {
            window.audioManager.stopMusic();
        }
        
        // REVEAL MAIN APP UI after Quest Giver is dismissed
        // This ensures no flickering - UI only shows after Quest Giver is handled
        if (document.documentElement.style.visibility === 'hidden') {
            document.documentElement.style.visibility = 'visible';

        }
        
        this.activeQuest = null;
        
        // Restore skin visuals after quest closes
        if (window.skinsManager && typeof window.skinsManager.updateAllMonsterVisuals === 'function') {
            window.skinsManager.updateAllMonsterVisuals();
        }
    }
}

// Initialize quest giver
window.questGiver = new QuestGiver();

// Check for expired quests
function checkExpiredQuests() {
    if (!window.gameState || !window.gameState.tasks) return;

    const now = Date.now();
    const expiredQuests = window.gameState.tasks.filter(task => 
        task.isQuest && task.questDeadline && task.questDeadline < now && !task.completed
    );

    expiredQuests.forEach(quest => {
        // Deduct XP penalty
        if (window.gameState) {
            if (typeof window.addJerryXP === 'function') {
                window.addJerryXP(-quest.questPenalty);
            } else {
                window.gameState.jerryXP = Math.max(0, (window.gameState.jerryXP || 0) - quest.questPenalty);

            }
        }
        
        // Remove quest from tasks
        const index = window.gameState.tasks.indexOf(quest);
        if (index > -1) {
            window.gameState.tasks.splice(index, 1);
        }

        showMessage(`⏰ Quest expired: "${quest.text}". -${quest.questPenalty} XP`);
    });

    if (expiredQuests.length > 0) {
        saveGameState();
        updateTaskDisplay();
        updateUI();
    }
}

// Check for expired quests every minute
setInterval(checkExpiredQuests, 60000);

// Trigger quest giver every hour
function triggerQuestGiver() {
    if (window.questGiver && window.questGiver.shouldAppear()) {
        window.questGiver.show();
    }
}

// Trigger Merlin quest from task completion
function triggerMerlinQuestFromTaskCompletion() {

    // Check if battle is currently active
    if (window.battleManager && window.battleManager.inBattle) {

        return;
    }
    
    if (!window.questGiver) {

        return;
    }
    
    if (!window.questGiver.shouldAppear()) {

        return;
    }

    window.questGiver.show();
}

// Expose to global scope
window.triggerMerlinQuestFromTaskCompletion = triggerMerlinQuestFromTaskCompletion;

// Check every 30 minutes to see if it's time
setInterval(triggerQuestGiver, 1800000); // 30 minutes

// GATING LOGIC: Check immediately on page load (no delay)
// This will be called by app initialization after DOM is ready
window.checkQuestGiverOnLoad = function() {
    if (window.questGiver && window.questGiver.shouldAppear()) {
        return true; // Quest giver is due
    }
    return false; // No quest giver needed
};


// Quest prompt modal handlers
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('questPromptModal');
    const yesBtn = document.getElementById('questPromptYes');
    const noBtn = document.getElementById('questPromptNo');
    
    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            // Initialize audio on user interaction
            if (window.audioManager) {
                window.audioManager.init();
            }
            
            // Hide modal
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // ENSURE MAIN APP UI IS VISIBLE before showing quest giver
            if (document.documentElement.style.visibility !== 'visible') {
                document.documentElement.style.visibility = 'visible';

            }
            
            // Show quest giver
            if (window.questGiver) {
                window.questGiver.showQuestGiverDirect();
            }
        });
    }
    
    if (noBtn) {
        noBtn.addEventListener('click', () => {
            // Hide modal
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // Clear active quest
            if (window.questGiver) {
                window.questGiver.activeQuest = null;
            }
            
            // REVEAL MAIN APP UI after user declines Quest Giver
            if (document.documentElement.style.visibility === 'hidden') {
                document.documentElement.style.visibility = 'visible';

            }
            
            // Extend habit tracker visibility by 2 minutes
            const habitTracker = document.getElementById('habitTracker');
            if (habitTracker) {
                habitTracker.style.transition = 'opacity 0.5s ease';
                habitTracker.style.opacity = '1';
                
                setTimeout(() => {
                    habitTracker.style.opacity = '';
                }, 120000); // 120 seconds (2 minutes)
            }
        });
    }
});
