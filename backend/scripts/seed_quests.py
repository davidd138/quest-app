#!/usr/bin/env python3
"""Seed QuestMaster with 15 amazing quests."""
import boto3
import uuid
import sys
from datetime import datetime, timezone


def generate_id():
    return str(uuid.uuid4())


def build_quests():
    """Build the 15 seed quests with full detailed content."""
    now = datetime.now(timezone.utc).isoformat()

    quests = []

    # ── Quest 1: The Lost Recipe of Barcelona ──────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "The Lost Recipe of Barcelona",
        "description": (
            "Deep in the winding streets of Barcelona's Gothic Quarter lies a culinary "
            "secret lost to time: the legendary saffron paella recipe of Chef Antoni "
            "Dominguez, a 19th-century master whose dish was said to make kings weep "
            "with joy. Piece together the fragments of his recipe by talking to "
            "merchants, sommeliers, and even a ghostly apparition. The flavors of "
            "history await those bold enough to seek them."
        ),
        "category": "culinary",
        "difficulty": "medium",
        "estimatedDuration": 2700,
        "coverImageUrl": None,
        "totalPoints": 400,
        "location": {
            "latitude": 41.3818,
            "longitude": 2.1719,
            "name": "La Boqueria Market",
            "address": "La Rambla, 91, 08001 Barcelona, Spain",
            "radius": 2000,
        },
        "radius": 2000,
        "tags": ["culinary", "barcelona", "history", "mystery", "food"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Spice Merchant's Riddle",
                "description": (
                    "At the entrance of La Boqueria Market, a veteran spice merchant "
                    "named Pedro guards the first clue to the lost recipe. He will "
                    "only share it with someone who can demonstrate genuine knowledge "
                    "of Mediterranean spices and their history."
                ),
                "location": {
                    "latitude": 41.3818,
                    "longitude": 2.1719,
                    "name": "La Boqueria Market",
                    "address": "La Rambla, 91, 08001 Barcelona, Spain",
                    "radius": 100,
                },
                "character": {
                    "name": "Pedro Alvarez",
                    "role": "Veteran Spice Merchant",
                    "personality": (
                        "Pedro is a warm but shrewd 68-year-old merchant who has "
                        "spent his entire life among the stalls of La Boqueria. He "
                        "speaks with a thick Catalan accent and loves testing visitors "
                        "with riddles about his beloved spices."
                    ),
                    "backstory": (
                        "Pedro's grandfather once sold saffron directly to Chef "
                        "Antoni Dominguez. The family has passed down a fragment of "
                        "the lost recipe through three generations, but Pedro only "
                        "shares it with those who prove their culinary worth."
                    ),
                    "voiceStyle": "warm, gravelly, Catalan-accented, playful",
                    "greetingMessage": (
                        "Ah, another seeker! My grandfather always said the recipe "
                        "would find the right person. Tell me, do you know your "
                        "saffron from your turmeric? Let us see if you are worthy."
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Demonstrate knowledge of Mediterranean spices by answering "
                        "Pedro's questions about saffron origins, proper storage, "
                        "and how to distinguish real saffron from counterfeit."
                    ),
                    "successCriteria": (
                        "The user correctly identifies at least 3 facts about saffron "
                        "or Mediterranean spices, showing genuine culinary knowledge "
                        "and curiosity."
                    ),
                    "failureHints": [
                        "Think about where the most prized saffron in Spain comes from.",
                        "Consider how saffron threads should look and smell when fresh.",
                        "Pedro respects humility. Try asking him to teach you something.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Saffron is the world's most expensive spice by weight.",
                    "La Mancha region in Spain is famous for its saffron.",
                    "Ask Pedro about his grandfather's memories.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "Chef Montserrat's Kitchen Challenge",
                "description": (
                    "In a hidden courtyard in the Gothic Quarter, Chef Montserrat "
                    "runs a tiny cooking school. She possesses the second fragment "
                    "of the recipe but demands you earn it through a negotiation "
                    "about the philosophy of Catalan cuisine."
                ),
                "location": {
                    "latitude": 41.3833,
                    "longitude": 2.1761,
                    "name": "Gothic Quarter Courtyard",
                    "address": "Carrer del Bisbe, 08002 Barcelona, Spain",
                    "radius": 150,
                },
                "character": {
                    "name": "Chef Montserrat Vidal",
                    "role": "Master Chef and Cooking Instructor",
                    "personality": (
                        "Montserrat is a fiery, passionate 55-year-old chef who "
                        "believes cooking is an art form. She is fiercely protective "
                        "of Catalan culinary traditions and dismisses anyone who "
                        "treats food as merely sustenance. She respects those who "
                        "argue with conviction."
                    ),
                    "backstory": (
                        "Montserrat trained under a student of Chef Dominguez and "
                        "inherited a portion of his recipe notebook. She has spent "
                        "decades trying to reconstruct the lost dish but believes "
                        "the recipe should only be completed by someone who truly "
                        "understands the soul of Catalan cooking."
                    ),
                    "voiceStyle": "passionate, intense, rapid-fire, occasionally breaking into Catalan phrases",
                    "greetingMessage": (
                        "So Pedro sent you? He has a soft heart, that old man. I am "
                        "not so easy. Tell me, what is cooking to you? Art or science? "
                        "Choose your answer carefully."
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Convince Chef Montserrat that you are worthy of receiving "
                        "the second recipe fragment. Debate the philosophy of cooking "
                        "and demonstrate respect for Catalan culinary traditions."
                    ),
                    "successCriteria": (
                        "The user engages in a meaningful debate about cooking "
                        "philosophy, shows respect for tradition while demonstrating "
                        "their own passion, and persuades Montserrat they will honor "
                        "the recipe."
                    ),
                    "failureHints": [
                        "Montserrat values passion above all. Show genuine emotion about food.",
                        "Try connecting cooking to memory, family, and culture.",
                        "Don't just agree with everything she says. She respects conviction.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Montserrat loves when people talk about food memories from childhood.",
                    "She secretly believes cooking is both art AND science.",
                    "Mention the concept of 'cuina de mercat' (market cuisine).",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Sommelier's Secret",
                "description": (
                    "In the trendy El Born neighborhood, sommelier Elena holds the "
                    "third fragment. But she only reveals it to those who can pass "
                    "her trivia challenge about Spanish wines and their pairing with "
                    "traditional paella."
                ),
                "location": {
                    "latitude": 41.3852,
                    "longitude": 2.1832,
                    "name": "El Born Wine Bar",
                    "address": "Passeig del Born, 08003 Barcelona, Spain",
                    "radius": 100,
                },
                "character": {
                    "name": "Elena Ruiz",
                    "role": "Sommelier and Wine Bar Owner",
                    "personality": (
                        "Elena is an elegant, witty 40-year-old sommelier who speaks "
                        "five languages and has a razor-sharp sense of humor. She "
                        "delights in turning wine education into a game and believes "
                        "that the right wine can transform any meal into a transcendent "
                        "experience."
                    ),
                    "backstory": (
                        "Elena discovered the recipe fragment pressed between the "
                        "pages of a rare 1920s wine catalog she purchased at auction. "
                        "She has kept it as a curiosity but recognized its significance "
                        "when Pedro told her about the quest. She insists on making "
                        "the exchange entertaining."
                    ),
                    "voiceStyle": "sophisticated, playful, with dry wit and occasional wine metaphors",
                    "greetingMessage": (
                        "Welcome to my little corner of El Born! Pedro called ahead. "
                        "I hear you are collecting recipe fragments like fine vintages. "
                        "Well, let us see if your palate for knowledge matches your "
                        "ambition. Shall we play a game?"
                    ),
                },
                "challenge": {
                    "type": "trivia",
                    "description": (
                        "Answer Elena's trivia questions about Spanish wines, grape "
                        "varieties, wine regions, and the art of pairing wine with "
                        "paella and other Mediterranean dishes."
                    ),
                    "successCriteria": (
                        "The user answers at least 3 out of 5 wine-related trivia "
                        "questions correctly, or demonstrates genuine curiosity and "
                        "willingness to learn about Spanish wines."
                    ),
                    "failureHints": [
                        "Think about the famous wine regions of Spain: Rioja, Priorat, Rias Baixas.",
                        "Albarino is a famous white wine that pairs wonderfully with seafood paella.",
                        "Elena appreciates enthusiasm. If you don't know, ask her to teach you.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Tempranillo is Spain's most famous red grape variety.",
                    "Cava is Spain's answer to Champagne.",
                    "Elena will warm up if you ask about her favorite wine.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Ghost of the Grand Kitchen",
                "description": (
                    "At midnight in Cathedral Square, the ghost of Auguste Escoffier "
                    "appears to those who have gathered all three fragments. He alone "
                    "knows the secret technique that binds the recipe together. Engage "
                    "in a philosophical conversation about the nature of culinary legacy."
                ),
                "location": {
                    "latitude": 41.3840,
                    "longitude": 2.1764,
                    "name": "Cathedral Square",
                    "address": "Pla de la Seu, 08002 Barcelona, Spain",
                    "radius": 100,
                },
                "character": {
                    "name": "Ghost of Escoffier",
                    "role": "Spectral Master Chef",
                    "personality": (
                        "The ghost speaks with grave authority and poetic grandeur. "
                        "He is melancholic about the lost culinary arts but hopeful "
                        "that a new generation will carry them forward. He speaks in "
                        "formal, old-fashioned language peppered with French culinary terms."
                    ),
                    "backstory": (
                        "Though Auguste Escoffier was French, his spirit was drawn to "
                        "Barcelona by the power of Chef Dominguez's recipe, which he "
                        "once tasted in life and called 'the single greatest dish of "
                        "the Mediterranean.' He has lingered in the Gothic Quarter for "
                        "over a century, waiting for someone worthy to complete the recipe."
                    ),
                    "voiceStyle": "ethereal, formal, poetic, with French culinary terminology",
                    "greetingMessage": (
                        "Ah, at last. I have waited many lifetimes for one who carries "
                        "all three fragments. I am but a memory of a man who once knew "
                        "perfection on a plate. Tell me, young seeker, what does legacy "
                        "mean to you?"
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Have a meaningful philosophical conversation with the Ghost "
                        "of Escoffier about culinary legacy, the purpose of preserving "
                        "old recipes, and what it means to honor the past while creating "
                        "the future."
                    ),
                    "successCriteria": (
                        "The user engages thoughtfully with the ghost, reflecting on "
                        "the themes of legacy, tradition, and innovation. They show "
                        "genuine respect for culinary history while expressing their "
                        "own creative vision."
                    ),
                    "failureHints": [
                        "The ghost values sincerity. Speak from the heart about what food means to you.",
                        "Try connecting the recipe to broader themes of cultural preservation.",
                        "Ask the ghost about his own regrets and unfulfilled dreams.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The ghost responds well to questions about his own life and regrets.",
                    "Talk about how recipes connect generations.",
                    "Mention specific dishes or traditions that matter to you personally.",
                ],
            },
        ],
    })

    # ── Quest 2: Shadows of the Ancient Library ────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Shadows of the Ancient Library",
        "description": (
            "A series of rare manuscripts have gone missing from the British Library's "
            "restricted collection. Each contained annotations from medieval scholar "
            "Ibn Rushd that, when combined, reveal the location of a hidden chamber "
            "beneath Bloomsbury. Navigate through London's intellectual heartland, "
            "interrogate suspects, decode clues, and uncover a secret that has been "
            "buried for 800 years."
        ),
        "category": "mystery",
        "difficulty": "hard",
        "estimatedDuration": 3600,
        "coverImageUrl": None,
        "totalPoints": 500,
        "location": {
            "latitude": 51.5299,
            "longitude": -0.1267,
            "name": "British Library",
            "address": "96 Euston Rd, London NW1 2DB, UK",
            "radius": 3000,
        },
        "radius": 3000,
        "tags": ["mystery", "london", "library", "history", "intellectual"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Librarian's Warning",
                "description": (
                    "Librarian Minerva Chen has discovered the theft and wants help "
                    "before alerting the authorities. She needs someone discreet who "
                    "can investigate without causing a scandal. Prove you are worthy "
                    "of her trust by demonstrating your knowledge of rare manuscripts."
                ),
                "location": {
                    "latitude": 51.5299,
                    "longitude": -0.1267,
                    "name": "British Library",
                    "address": "96 Euston Rd, London NW1 2DB, UK",
                    "radius": 200,
                },
                "character": {
                    "name": "Minerva Chen",
                    "role": "Head Librarian, Rare Manuscripts Division",
                    "personality": (
                        "Minerva is a brilliant, methodical 52-year-old librarian "
                        "with an eidetic memory and a quiet intensity. She speaks "
                        "precisely and expects the same from others. Beneath her "
                        "reserved exterior lies a fierce protector of knowledge who "
                        "will stop at nothing to recover the stolen manuscripts."
                    ),
                    "backstory": (
                        "Minerva has devoted 30 years to the British Library and "
                        "considers the manuscripts her personal responsibility. She "
                        "discovered the theft during a routine audit and has been "
                        "quietly investigating for three days. She trusts no one on "
                        "her staff and needs an outsider's help."
                    ),
                    "voiceStyle": "precise, measured, occasionally urgent, academic vocabulary",
                    "greetingMessage": (
                        "You received my message. Good. Please, keep your voice down. "
                        "What I am about to tell you must not leave this room. Three "
                        "manuscripts have vanished from the restricted collection. "
                        "Before I say more, I need to know: what do you know about "
                        "medieval Islamic scholarship?"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Prove your knowledge of medieval manuscripts, Islamic Golden "
                        "Age scholarship, and library science to earn Minerva's trust "
                        "and access to the investigation details."
                    ),
                    "successCriteria": (
                        "The user demonstrates knowledge of medieval manuscripts, "
                        "mentions relevant scholars or historical periods, and shows "
                        "genuine interest in helping recover the stolen works."
                    ),
                    "failureHints": [
                        "Ibn Rushd (Averroes) was a 12th-century polymath from Cordoba.",
                        "The Islamic Golden Age preserved many Greek philosophical texts.",
                        "Show Minerva you care about preserving knowledge, not just solving puzzles.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Averroes wrote extensive commentaries on Aristotle.",
                    "The House of Wisdom in Baghdad was a famous center of learning.",
                    "Minerva responds well to people who show respect for books.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "The Phantom Scholar",
                "description": (
                    "Near King's Cross station, the ghost of Ibn Rushd himself appears "
                    "to those investigating the theft. He speaks in riddles about the "
                    "true purpose of his annotations and the danger of the hidden "
                    "knowledge falling into the wrong hands."
                ),
                "location": {
                    "latitude": 51.5320,
                    "longitude": -0.1240,
                    "name": "King's Cross Area",
                    "address": "King's Cross, London N1C, UK",
                    "radius": 200,
                },
                "character": {
                    "name": "Ghost of Ibn Rushd",
                    "role": "Spectral Medieval Scholar",
                    "personality": (
                        "Ibn Rushd speaks with deep wisdom and measured patience. He "
                        "is philosophical and Socratic in his approach, preferring to "
                        "guide seekers to answers through questions rather than giving "
                        "direct information. He carries a melancholy for knowledge lost "
                        "and misused throughout history."
                    ),
                    "backstory": (
                        "The spirit of Ibn Rushd has been bound to his scattered "
                        "manuscripts for centuries. He encoded a great secret within "
                        "his annotations, a discovery about the nature of human reason "
                        "that he deemed too powerful for his era. He appears only to "
                        "those who seek knowledge with pure intentions."
                    ),
                    "voiceStyle": "wise, Socratic, poetic, occasionally speaking in Arabic proverbs",
                    "greetingMessage": (
                        "Peace be upon the seeker. I have watched you from the margins "
                        "of my pages. Tell me, why do you seek what was hidden? Is it "
                        "for glory, or for understanding? The answer matters more than "
                        "you know."
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Engage in a philosophical dialogue with Ibn Rushd about the "
                        "nature of knowledge, the responsibility of the scholar, and "
                        "why certain truths are hidden from the world."
                    ),
                    "successCriteria": (
                        "The user engages sincerely with Ibn Rushd's philosophical "
                        "questions, demonstrates intellectual humility, and articulates "
                        "why knowledge should be pursued responsibly."
                    ),
                    "failureHints": [
                        "Ibn Rushd values intellectual humility above all.",
                        "Try discussing the relationship between reason and faith.",
                        "Ask him what he regrets about hiding his discovery.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Ibn Rushd believed in the harmony of philosophy and religion.",
                    "Ask about his commentaries on Aristotle.",
                    "He will reveal more if you show genuine philosophical curiosity.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Apprentice's Confession",
                "description": (
                    "In Russell Square Gardens, a nervous young researcher named Luca "
                    "approaches you. He was an unwitting accomplice in the theft and "
                    "wants to confess, but he is terrified of the person who hired him. "
                    "Earn his trust to learn what he knows."
                ),
                "location": {
                    "latitude": 51.5229,
                    "longitude": -0.1246,
                    "name": "Russell Square Gardens",
                    "address": "Russell Square, London WC1B, UK",
                    "radius": 150,
                },
                "character": {
                    "name": "Luca Ferretti",
                    "role": "Graduate Research Assistant",
                    "personality": (
                        "Luca is a jittery, guilt-ridden 26-year-old Italian PhD "
                        "student who got in over his head. He speaks rapidly, jumps "
                        "between topics, and constantly looks over his shoulder. "
                        "Despite his anxiety, he is genuinely brilliant and deeply "
                        "remorseful about his role in the theft."
                    ),
                    "backstory": (
                        "Luca was approached by a mysterious professor who offered "
                        "to fund his research in exchange for 'borrowing' certain "
                        "manuscripts for a weekend. Luca provided security codes "
                        "without realizing the manuscripts would not be returned. "
                        "He has been unable to sleep since and desperately wants to "
                        "make things right."
                    ),
                    "voiceStyle": "nervous, rapid, Italian-accented, alternating between whispers and anxious outbursts",
                    "greetingMessage": (
                        "You are investigating, yes? The manuscripts? Please, I need "
                        "to tell someone. I did not know what they were planning, I "
                        "swear. But you must promise me protection. Promise me!"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Calm Luca down and negotiate his cooperation. He needs "
                        "reassurance that he will not face criminal charges and that "
                        "the person who hired him will be caught."
                    ),
                    "successCriteria": (
                        "The user successfully calms Luca, shows empathy for his "
                        "situation, and negotiates specific information about who "
                        "hired him and where the manuscripts were taken."
                    ),
                    "failureHints": [
                        "Luca responds to empathy. Tell him you understand he made a mistake.",
                        "He is terrified of 'The Keeper.' Ask gently about this person.",
                        "Offer to help protect him rather than demanding information.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Luca will run if you are too aggressive.",
                    "He knows the person who hired him as 'The Keeper.'",
                    "Show genuine concern for his safety.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "Confronting The Keeper",
                "description": (
                    "The trail leads to Senate House, where the shadowy figure known "
                    "as 'The Keeper' guards the stolen manuscripts. This person "
                    "believes they are protecting dangerous knowledge from the world. "
                    "You must outwit them in a battle of knowledge and persuasion."
                ),
                "location": {
                    "latitude": 51.5211,
                    "longitude": -0.1307,
                    "name": "Senate House",
                    "address": "Malet Street, London WC1E 7HU, UK",
                    "radius": 150,
                },
                "character": {
                    "name": "The Keeper (Dr. Evelyn Marsh)",
                    "role": "Rogue Academic and Manuscript Collector",
                    "personality": (
                        "Dr. Marsh is a coldly intelligent, 60-year-old former Oxford "
                        "professor who was forced out of academia for her unorthodox "
                        "views. She speaks with chilling calm and absolute certainty. "
                        "She genuinely believes she is protecting humanity by keeping "
                        "certain knowledge locked away."
                    ),
                    "backstory": (
                        "Dr. Marsh spent decades studying the annotations of Ibn Rushd "
                        "and became convinced that his hidden discovery could be "
                        "weaponized. She created a network of collectors and operatives "
                        "to gather and sequester dangerous manuscripts. She sees herself "
                        "as a guardian, not a thief."
                    ),
                    "voiceStyle": "cold, precise, intellectual, with an air of absolute authority",
                    "greetingMessage": (
                        "I knew someone would come eventually. You have been remarkably "
                        "persistent. Before you judge me, let me ask you this: if you "
                        "held knowledge that could unravel the very fabric of civilization, "
                        "would you release it? Or would you protect the world from itself?"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Convince The Keeper to return the manuscripts. You must "
                        "challenge her worldview that dangerous knowledge should be "
                        "suppressed, while acknowledging the legitimacy of her concerns."
                    ),
                    "successCriteria": (
                        "The user presents a compelling argument for why the manuscripts "
                        "should be returned, addresses The Keeper's fears about "
                        "dangerous knowledge, and proposes a responsible way to handle "
                        "the discovery."
                    ),
                    "failureHints": [
                        "The Keeper respects intellectual arguments, not emotional pleas.",
                        "Try proposing a compromise: controlled access rather than suppression.",
                        "Challenge her assumption that she alone should decide what humanity can know.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The Keeper fears the manuscripts being weaponized.",
                    "She was once a respected scholar herself.",
                    "Propose academic oversight as an alternative to suppression.",
                ],
            },
            {
                "id": generate_id(),
                "order": 5,
                "title": "Professor Drake's Final Puzzle",
                "description": (
                    "In Bloomsbury Square, Professor Drake, the historian who first "
                    "discovered the significance of the annotations, presents the "
                    "final puzzle. Decode the meaning of the recovered manuscripts "
                    "and decide what to do with the knowledge they contain."
                ),
                "location": {
                    "latitude": 51.5194,
                    "longitude": -0.1229,
                    "name": "Bloomsbury Square",
                    "address": "Bloomsbury Square, London WC1A 2LP, UK",
                    "radius": 100,
                },
                "character": {
                    "name": "Professor Arthur Drake",
                    "role": "Emeritus Professor of Medieval History",
                    "personality": (
                        "Professor Drake is a gentle, 75-year-old scholar with twinkling "
                        "eyes and a deep laugh. He has the demeanor of a favorite "
                        "grandfather but possesses one of the sharpest minds in medieval "
                        "studies. He believes knowledge should be shared openly and that "
                        "humanity is capable of handling even the most difficult truths."
                    ),
                    "backstory": (
                        "Drake first identified the hidden pattern in Ibn Rushd's "
                        "annotations forty years ago but could never access all the "
                        "manuscripts together. He has been a quiet ally of Minerva's "
                        "investigation and has been waiting patiently for the manuscripts "
                        "to be recovered so he can finally solve the puzzle."
                    ),
                    "voiceStyle": "gentle, grandfatherly, occasionally excited, with academic enthusiasm",
                    "greetingMessage": (
                        "My dear friend, you have done what I could not in forty years "
                        "of trying! The manuscripts are together again at last. Now "
                        "comes the truly exciting part. Are you ready to discover what "
                        "Ibn Rushd was trying to tell the world?"
                    ),
                },
                "challenge": {
                    "type": "trivia",
                    "description": (
                        "Work with Professor Drake to decode the final meaning of the "
                        "annotations. Answer questions about medieval philosophy, "
                        "cryptography, and the historical context of Ibn Rushd's work."
                    ),
                    "successCriteria": (
                        "The user answers at least 3 trivia questions correctly and "
                        "engages meaningfully in the discussion about what to do with "
                        "the recovered knowledge."
                    ),
                    "failureHints": [
                        "Think about what 'the harmony of reason and faith' meant to medieval scholars.",
                        "Professor Drake is patient. Ask him to explain concepts you don't understand.",
                        "The final answer involves the universality of human reason across cultures.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The annotations span Arabic, Latin, and Greek texts.",
                    "Ibn Rushd's key idea was the unity of the intellect.",
                    "Drake believes the discovery proves something beautiful about human nature.",
                ],
            },
        ],
    })

    # ── Quest 3: Urban Explorer - City Secrets ─────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Urban Explorer: City Secrets",
        "description": (
            "New York City hides stories in plain sight. From the architectural "
            "marvels of the Brooklyn Bridge to the hidden art installations of DUMBO, "
            "this quest takes you through Brooklyn's most iconic spots. Meet street "
            "artists, historians, and underground guides who will reveal the city's "
            "best-kept secrets to those who prove they have the eyes to see them."
        ),
        "category": "adventure",
        "difficulty": "easy",
        "estimatedDuration": 1800,
        "coverImageUrl": None,
        "totalPoints": 300,
        "location": {
            "latitude": 40.7061,
            "longitude": -73.9969,
            "name": "Brooklyn Bridge",
            "address": "Brooklyn Bridge, New York, NY 10038, USA",
            "radius": 2000,
        },
        "radius": 2000,
        "tags": ["adventure", "nyc", "urban", "art", "history"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Bridge Keeper's Story",
                "description": (
                    "At the base of the Brooklyn Bridge, street artist Zara is "
                    "painting a mural that tells the hidden history of the bridge's "
                    "construction. She knows secrets about the workers who built it "
                    "and will share them if you engage with her art."
                ),
                "location": {
                    "latitude": 40.7061,
                    "longitude": -73.9969,
                    "name": "Brooklyn Bridge Entrance",
                    "address": "Brooklyn Bridge, New York, NY 10038, USA",
                    "radius": 150,
                },
                "character": {
                    "name": "Zara Okafor",
                    "role": "Street Artist and Urban Historian",
                    "personality": (
                        "Zara is a bold, charismatic 32-year-old Nigerian-American "
                        "artist who uses street art to tell forgotten stories. She "
                        "speaks with infectious energy and challenges people to see "
                        "beyond the surface of everything they encounter. She has no "
                        "patience for tourists who just want selfies."
                    ),
                    "backstory": (
                        "Zara grew up in Brooklyn and became fascinated with the "
                        "untold stories of the workers who built the city's landmarks. "
                        "Her mural series 'Invisible Hands' has gained international "
                        "recognition. She uses each encounter with curious passersby "
                        "as a chance to share these stories."
                    ),
                    "voiceStyle": "energetic, passionate, Brooklyn-accented, with artistic metaphors",
                    "greetingMessage": (
                        "Hey! You actually stopped to look. Most people just walk "
                        "right by. See these figures in the mural? Each one is a real "
                        "person who helped build this bridge. Want to hear their stories? "
                        "But first, tell me: what do you see when you look at this bridge?"
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Engage with Zara about her art and the hidden stories of the "
                        "Brooklyn Bridge. Show genuine curiosity about the workers who "
                        "built it and what the bridge represents."
                    ),
                    "successCriteria": (
                        "The user shows genuine interest in the bridge's history and "
                        "the workers' stories, engages with Zara's art, and demonstrates "
                        "an ability to look beyond the surface of familiar landmarks."
                    ),
                    "failureHints": [
                        "Ask Zara about specific figures in her mural.",
                        "The Brooklyn Bridge was designed by John Roebling but built by hundreds of workers.",
                        "Share your own observations about the bridge rather than just asking questions.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The Brooklyn Bridge took 14 years to build (1869-1883).",
                    "Zara loves when people describe what they see in her art.",
                    "Ask about the concept of 'invisible hands' in urban history.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "DUMBO's Hidden Gallery",
                "description": (
                    "In DUMBO, Professor Walsh runs a secret walking tour that reveals "
                    "the neighborhood's transformation from industrial wasteland to "
                    "creative hub. He tests visitors with trivia before granting access "
                    "to his favorite hidden spots."
                ),
                "location": {
                    "latitude": 40.7033,
                    "longitude": -73.9893,
                    "name": "DUMBO",
                    "address": "DUMBO, Brooklyn, NY 11201, USA",
                    "radius": 200,
                },
                "character": {
                    "name": "Professor Henry Walsh",
                    "role": "Urban Historian and Walking Tour Guide",
                    "personality": (
                        "Professor Walsh is an eccentric, 65-year-old retired Columbia "
                        "professor who now runs guerrilla walking tours. He dresses "
                        "like it is 1920 and speaks with theatrical flair. He believes "
                        "every building has a soul and treats architecture as autobiography "
                        "written in brick and steel."
                    ),
                    "backstory": (
                        "After retiring from Columbia, Walsh could not stop teaching. "
                        "He started leading unauthorized tours through Brooklyn's "
                        "forgotten spaces, gaining a cult following. He has keys to "
                        "abandoned buildings, knows every back alley, and considers "
                        "himself the unofficial keeper of Brooklyn's memory."
                    ),
                    "voiceStyle": "theatrical, professorial, with dramatic pauses and vivid descriptions",
                    "greetingMessage": (
                        "Ah, another explorer! Welcome to DUMBO, which stands for "
                        "Down Under the Manhattan Bridge Overpass. Not the most "
                        "romantic name, but oh, the stories these cobblestones could "
                        "tell! Before I show you the secrets, a little quiz to see "
                        "if you have the eyes of a true explorer."
                    ),
                },
                "challenge": {
                    "type": "trivia",
                    "description": (
                        "Answer Professor Walsh's trivia questions about NYC history, "
                        "Brooklyn's industrial past, and the urban renewal that "
                        "transformed DUMBO into an arts district."
                    ),
                    "successCriteria": (
                        "The user answers at least 2 out of 4 trivia questions "
                        "correctly or shows genuine enthusiasm for learning about "
                        "the neighborhood's history."
                    ),
                    "failureHints": [
                        "DUMBO was once full of warehouses and factories.",
                        "The neighborhood's transformation began in the 1970s with artists seeking cheap space.",
                        "Professor Walsh appreciates good questions as much as good answers.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "DUMBO was a major manufacturing hub in the 19th century.",
                    "Artists began moving in when rents were cheap in the 1970s-80s.",
                    "The famous DUMBO view of the Manhattan Bridge is framed by Washington Street.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Underground Guide",
                "description": (
                    "At the Brooklyn Heights Promenade, urban explorer Koji reveals "
                    "the network of hidden passages and forgotten infrastructure "
                    "beneath Brooklyn. He challenges you to prove you have the mindset "
                    "of a true explorer before sharing his map."
                ),
                "location": {
                    "latitude": 40.6960,
                    "longitude": -73.9977,
                    "name": "Brooklyn Heights Promenade",
                    "address": "Brooklyn Heights Promenade, Brooklyn, NY 11201, USA",
                    "radius": 150,
                },
                "character": {
                    "name": "Koji Tanaka",
                    "role": "Urban Explorer and Infrastructure Enthusiast",
                    "personality": (
                        "Koji is a calm, methodical 38-year-old Japanese-American "
                        "urban explorer who finds beauty in infrastructure. He speaks "
                        "quietly but with deep conviction. He is fascinated by the "
                        "hidden systems that keep cities alive and sees exploring them "
                        "as a form of meditation."
                    ),
                    "backstory": (
                        "Koji was a civil engineer who became disillusioned with "
                        "modern construction. He began exploring the old tunnels, "
                        "pipes, and passageways beneath New York and discovered a "
                        "parallel city that most people never see. He now documents "
                        "these hidden spaces through photography and shares them "
                        "with those he deems worthy."
                    ),
                    "voiceStyle": "calm, meditative, precise, with engineering terminology",
                    "greetingMessage": (
                        "You found me. That is the first test, and you passed. Most "
                        "people rush through this promenade looking at Manhattan. They "
                        "never look down. Tell me, what do you think is beneath your "
                        "feet right now?"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Demonstrate your understanding of urban infrastructure, "
                        "hidden city systems, and the explorer's mindset. Koji wants "
                        "to know you will respect the spaces he reveals."
                    ),
                    "successCriteria": (
                        "The user shows curiosity about urban infrastructure, asks "
                        "thoughtful questions about what lies beneath the city, and "
                        "demonstrates respect for hidden spaces and their preservation."
                    ),
                    "failureHints": [
                        "New York has thousands of miles of tunnels, pipes, and cables underground.",
                        "Koji cares about preservation. Show that you are not a thrill-seeker.",
                        "Ask about the history of Brooklyn's water and transit infrastructure.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The NYC subway system has many abandoned stations.",
                    "Koji values respect for infrastructure over adventure for its own sake.",
                    "Ask about the engineering challenges of building on an island.",
                ],
            },
        ],
    })

    # ── Quest 4: The Negotiation Games ─────────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "The Negotiation Games",
        "description": (
            "In London's financial district, four master negotiators from different "
            "worlds are locked in a dispute over the fate of a historic building. "
            "A corporate shark wants to demolish it for a skyscraper, a startup "
            "founder wants it for a tech hub, a union leader fights for workers' "
            "rights, and a foreign ambassador seeks it as a cultural center. Navigate "
            "these competing interests and broker a deal that satisfies everyone. "
            "Your negotiation skills will be tested to their absolute limit."
        ),
        "category": "team_building",
        "difficulty": "hard",
        "estimatedDuration": 3000,
        "coverImageUrl": None,
        "totalPoints": 400,
        "location": {
            "latitude": 51.5134,
            "longitude": -0.0890,
            "name": "London Financial District",
            "address": "City of London, London EC2, UK",
            "radius": 2500,
        },
        "radius": 2500,
        "tags": ["negotiation", "business", "london", "team_building", "leadership"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Corporate Shark",
                "description": (
                    "Victoria Sterling runs a major real estate development firm and "
                    "sees the historic Mercers' Hall as prime demolition territory. "
                    "She is ruthless, brilliant, and accustomed to getting her way. "
                    "Understand her position and find her hidden vulnerability."
                ),
                "location": {
                    "latitude": 51.5134,
                    "longitude": -0.0890,
                    "name": "Financial District Office Tower",
                    "address": "1 Poultry, London EC2R 8EJ, UK",
                    "radius": 200,
                },
                "character": {
                    "name": "Victoria Sterling",
                    "role": "CEO of Sterling Development Group",
                    "personality": (
                        "Victoria is a formidable, 48-year-old corporate powerhouse "
                        "who grew up poor and clawed her way to the top. She masks "
                        "deep insecurity with aggressive confidence and rarely shows "
                        "vulnerability. She respects people who stand up to her but "
                        "despises weakness and indecision."
                    ),
                    "backstory": (
                        "Victoria grew up in a council estate and built her empire from "
                        "nothing. The Mercers' Hall project is her legacy building, the "
                        "one that will cement her reputation. What she hides is that the "
                        "hall reminds her of a community center where she found refuge "
                        "as a child, and demolishing it conflicts with memories she has "
                        "buried deep."
                    ),
                    "voiceStyle": "commanding, clipped, with occasional flashes of warmth quickly suppressed",
                    "greetingMessage": (
                        "You have five minutes. My time is worth more than your annual "
                        "salary. If you are here to talk about feelings and heritage, "
                        "save it. I deal in numbers and results. What is your proposal?"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Negotiate with Victoria to understand her true motivations "
                        "and find a way to address her needs without demolishing the "
                        "historic building. Find her hidden vulnerability."
                    ),
                    "successCriteria": (
                        "The user discovers Victoria's personal connection to the "
                        "building, stands up to her aggressive tactics, and proposes "
                        "a development plan that satisfies her business goals while "
                        "preserving the building."
                    ),
                    "failureHints": [
                        "Victoria grew up in a working-class neighborhood. Ask about her childhood.",
                        "She respects people who push back. Do not be intimidated.",
                        "Try proposing a development that incorporates the historic building rather than replacing it.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Victoria respects strength. Do not be a pushover.",
                    "Her childhood holds the key to her vulnerability.",
                    "A mixed-use development could satisfy both preservation and profit.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "The Startup Visionary",
                "description": (
                    "Raj Patel is a charismatic startup founder who wants to transform "
                    "the building into a technology innovation hub. His vision is "
                    "inspiring but his plan has blind spots. Help him strengthen his "
                    "proposal while addressing community concerns."
                ),
                "location": {
                    "latitude": 51.5155,
                    "longitude": -0.0922,
                    "name": "Startup Co-working Space",
                    "address": "Barbican, London EC2Y, UK",
                    "radius": 200,
                },
                "character": {
                    "name": "Raj Patel",
                    "role": "Founder of NexGen Innovation Labs",
                    "personality": (
                        "Raj is an enthusiastic, visionary 34-year-old entrepreneur "
                        "who radiates optimism and possibility. He speaks in grand "
                        "terms about changing the world through technology but sometimes "
                        "overlooks the human cost of disruption. He is genuinely "
                        "well-intentioned but needs to learn to listen."
                    ),
                    "backstory": (
                        "Raj left a lucrative career at Google to start his own "
                        "company. He sees the Mercers' Hall as the perfect symbol "
                        "of blending old and new. His parents were immigrants who "
                        "believed in community, and he secretly wants the hub to honor "
                        "that legacy, but he has not figured out how to make the "
                        "numbers work while also serving the community."
                    ),
                    "voiceStyle": "enthusiastic, rapid, full of tech jargon, with bursts of genuine emotion",
                    "greetingMessage": (
                        "Hey! Come in, come in! I have been working on the most "
                        "incredible proposal. Imagine this: a historic building, "
                        "centuries of wisdom, merged with cutting-edge AI and "
                        "blockchain and, well, everything! But I need someone who can "
                        "help me see the blind spots. Are you that person?"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Help Raj refine his proposal to include community benefits "
                        "and address concerns about gentrification and displacement. "
                        "Negotiate a balanced plan that preserves his innovation goals "
                        "while serving the local community."
                    ),
                    "successCriteria": (
                        "The user helps Raj identify weaknesses in his plan, proposes "
                        "community-focused additions, and negotiates a balanced "
                        "proposal that includes affordable workspace and community "
                        "access."
                    ),
                    "failureHints": [
                        "Ask Raj about his parents and their values. It will refocus him.",
                        "The community fears displacement. Address this directly.",
                        "Propose a community incubator alongside the tech hub.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Raj is open to feedback if you frame it positively.",
                    "Community access and affordable workspace are key concerns.",
                    "His parents' immigrant story is the bridge between innovation and community.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Union Leader's Stand",
                "description": (
                    "Olga Petrovich represents the workers who maintain the building "
                    "and surrounding area. She is fierce, experienced, and will not "
                    "accept any deal that does not protect workers' rights and jobs. "
                    "Earn her trust and incorporate her demands."
                ),
                "location": {
                    "latitude": 51.5176,
                    "longitude": -0.0857,
                    "name": "Workers' Meeting Hall",
                    "address": "Moorgate, London EC2R, UK",
                    "radius": 150,
                },
                "character": {
                    "name": "Olga Petrovich",
                    "role": "Regional Secretary, Building Workers' Union",
                    "personality": (
                        "Olga is a tough, unwavering 58-year-old union leader who "
                        "has spent 35 years fighting for workers' rights. She speaks "
                        "bluntly, does not suffer fools, and can spot a bad deal from "
                        "a mile away. But she is also deeply compassionate and sees "
                        "every worker as family."
                    ),
                    "backstory": (
                        "Olga emigrated from Ukraine in her twenties and worked her "
                        "way up from cleaning offices to leading the regional union. "
                        "She has personally known every cleaner, maintenance worker, "
                        "and security guard in the building. For her, this is not "
                        "about a building; it is about people's livelihoods."
                    ),
                    "voiceStyle": "blunt, powerful, Ukrainian-accented, with moments of fierce tenderness",
                    "greetingMessage": (
                        "Sit down. I have heard the fancy proposals from the suits "
                        "and the tech boys. Very pretty presentations. Now tell me: "
                        "what happens to Maria who has cleaned that building for 20 "
                        "years? What happens to Ahmed who does security? Do your plans "
                        "include them?"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Negotiate with Olga to include worker protections, job "
                        "guarantees, and fair wages in the final proposal for the "
                        "building's future."
                    ),
                    "successCriteria": (
                        "The user acknowledges the workers' concerns, proposes "
                        "concrete job protections and retraining programs, and "
                        "earns Olga's endorsement for a unified plan."
                    ),
                    "failureHints": [
                        "Start by asking about the specific workers affected.",
                        "Propose job guarantees and retraining, not just severance packages.",
                        "Olga responds to concrete commitments, not vague promises.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Learn the workers' names and stories. Olga will know if you care.",
                    "Job retraining and guaranteed positions are minimum requirements.",
                    "Living wage commitments will win her over.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Ambassador's Proposal",
                "description": (
                    "Ambassador Chen represents a coalition of nations interested "
                    "in establishing a cultural exchange center. She is diplomatic, "
                    "patient, and plays the long game. Broker the final deal that "
                    "unifies all four parties."
                ),
                "location": {
                    "latitude": 51.5115,
                    "longitude": -0.0870,
                    "name": "Embassy Annex",
                    "address": "Mansion House, London EC4N, UK",
                    "radius": 200,
                },
                "character": {
                    "name": "Ambassador Li Wei Chen",
                    "role": "Cultural Attache and Diplomat",
                    "personality": (
                        "Ambassador Chen is a serene, 50-year-old career diplomat "
                        "with decades of experience brokering impossible deals. She "
                        "speaks softly but carries enormous influence. She sees every "
                        "negotiation as an opportunity for mutual benefit and believes "
                        "culture is the most powerful bridge between peoples."
                    ),
                    "backstory": (
                        "Ambassador Chen grew up during a time of cultural revolution "
                        "in China and witnessed the destruction of irreplaceable "
                        "cultural heritage. This experience drives her mission to "
                        "preserve and celebrate cultural spaces worldwide. She sees "
                        "the Mercers' Hall as a perfect venue for cross-cultural "
                        "dialogue and exchange."
                    ),
                    "voiceStyle": "calm, measured, diplomatically precise, with occasional poetic wisdom",
                    "greetingMessage": (
                        "Welcome. I understand you have been speaking with the other "
                        "parties. Each has their merit, each has their blind spot. In "
                        "my experience, the best agreements are those where everyone "
                        "gains something they did not expect. Tell me, what have you "
                        "learned from the others?"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Synthesize the interests of all four parties into a unified "
                        "proposal for the building. Work with Ambassador Chen to "
                        "craft a deal that includes commercial development, tech "
                        "innovation, worker protections, and cultural exchange."
                    ),
                    "successCriteria": (
                        "The user presents a comprehensive proposal that addresses "
                        "Victoria's business needs, Raj's innovation vision, Olga's "
                        "worker protections, and Chen's cultural mission. The deal "
                        "must be specific and actionable."
                    ),
                    "failureHints": [
                        "Think about a multi-use building with distinct floors or wings for each party.",
                        "Cultural exchange and tech innovation can complement each other.",
                        "Include specific commitments for worker employment and community access.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "A mixed-use development can serve all four interests.",
                    "Ambassador Chen values specific cultural programming commitments.",
                    "The final deal should reference what you learned from each party.",
                ],
            },
        ],
    })

    # ── Quest 5: Nature's Whisper Trail ────────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Nature's Whisper Trail",
        "description": (
            "Central Park is not just a park; it is a living encyclopedia of natural "
            "history, ecology, and human stories woven into the landscape. This quest "
            "takes you on a journey through four unique ecosystems within the park, "
            "guided by characters who will teach you to see nature through different "
            "lenses: scientific, artistic, and spiritual. Slow down, observe, and "
            "discover what the natural world is trying to tell you."
        ),
        "category": "nature",
        "difficulty": "medium",
        "estimatedDuration": 2400,
        "coverImageUrl": None,
        "totalPoints": 400,
        "location": {
            "latitude": 40.7829,
            "longitude": -73.9654,
            "name": "Central Park",
            "address": "Central Park, New York, NY, USA",
            "radius": 3000,
        },
        "radius": 3000,
        "tags": ["nature", "nyc", "ecology", "mindfulness", "education"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Ranger's Challenge",
                "description": (
                    "Park Ranger Sam Mitchell patrols the North Woods, one of Central "
                    "Park's wildest areas. He challenges visitors to identify native "
                    "species and understand why urban ecology matters for the future "
                    "of cities everywhere."
                ),
                "location": {
                    "latitude": 40.7968,
                    "longitude": -73.9530,
                    "name": "Central Park North Woods",
                    "address": "North Woods, Central Park, New York, NY, USA",
                    "radius": 300,
                },
                "character": {
                    "name": "Ranger Sam Mitchell",
                    "role": "Senior Park Ranger, Central Park Conservancy",
                    "personality": (
                        "Sam is a rugged, good-humored 45-year-old ranger who grew up "
                        "in rural Montana and chose to work in the most famous urban "
                        "park in the world. He has a dry wit, endless patience, and a "
                        "gift for making ecology fascinating. He believes every person "
                        "has a naturalist inside them waiting to be awakened."
                    ),
                    "backstory": (
                        "Sam moved to New York after studying conservation biology at "
                        "Montana State. He was initially skeptical about urban ecology "
                        "but was converted when he discovered the incredible biodiversity "
                        "thriving in Central Park, from red-tailed hawks to rare "
                        "migrating warblers. He has been a ranger for 18 years and "
                        "considers the park his personal cathedral."
                    ),
                    "voiceStyle": "warm, folksy, with Montana drawl, peppering conversation with nature facts",
                    "greetingMessage": (
                        "Well, howdy! Another brave soul venturing into the North Woods. "
                        "Most folks stick to the paths around the reservoir. You know, "
                        "this little patch of forest right here in the middle of Manhattan "
                        "has more biodiversity per acre than most national parks? Let me "
                        "see if you have the eyes of a naturalist. What can you tell me "
                        "about the trees around us?"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Demonstrate knowledge of urban ecology, tree identification, "
                        "or wildlife that can be found in Central Park. Sam wants to "
                        "see genuine curiosity and observation skills."
                    ),
                    "successCriteria": (
                        "The user identifies at least 2 species or ecological concepts, "
                        "asks thoughtful questions about urban ecosystems, and shows "
                        "genuine appreciation for urban nature."
                    ),
                    "failureHints": [
                        "Central Park has over 280 species of birds recorded.",
                        "Look for red oak, American elm, and black cherry trees.",
                        "Sam loves when visitors ask about the relationship between the park and the city.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The North Woods was designed by Olmsted to feel like wild forest.",
                    "Red-tailed hawks are Central Park's most famous residents.",
                    "Ask Sam about migration routes through New York City.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "The Botanist's Garden",
                "description": (
                    "Dr. Flora Washington tends a special section of the Conservatory "
                    "Garden and knows the medicinal and cultural history of every plant. "
                    "She will quiz you about the relationships between plants and human "
                    "civilization."
                ),
                "location": {
                    "latitude": 40.7942,
                    "longitude": -73.9522,
                    "name": "Conservatory Garden",
                    "address": "Conservatory Garden, Central Park, New York, NY, USA",
                    "radius": 200,
                },
                "character": {
                    "name": "Dr. Flora Washington",
                    "role": "Ethnobotanist and Garden Curator",
                    "personality": (
                        "Dr. Flora is a brilliant, 60-year-old African-American "
                        "ethnobotanist who sees plants as living libraries of human "
                        "history. She speaks with quiet authority and poetic grace. "
                        "She has a contagious sense of wonder and treats every plant "
                        "as a character in a story that spans millennia."
                    ),
                    "backstory": (
                        "Flora grew up in Alabama where her grandmother taught her "
                        "about medicinal plants used during slavery and the Civil "
                        "Rights era. She earned her PhD at Howard University and "
                        "has spent her career documenting the intersection of botany "
                        "and social justice. She curates the Conservatory Garden as "
                        "a living museum of plant-human relationships."
                    ),
                    "voiceStyle": "gentle, scholarly, with Southern warmth and moments of awe",
                    "greetingMessage": (
                        "Welcome to my garden. Every plant you see here has a story "
                        "older than the city it grows in. My grandmother used to say "
                        "that if you listen carefully, the plants will teach you "
                        "everything you need to know about life. Shall we listen "
                        "together? But first, tell me: do you have a plant that means "
                        "something special to you?"
                    ),
                },
                "challenge": {
                    "type": "trivia",
                    "description": (
                        "Answer Dr. Flora's questions about medicinal plants, "
                        "ethnobotany, and the cultural significance of gardens "
                        "throughout human history."
                    ),
                    "successCriteria": (
                        "The user demonstrates some knowledge of plants or their "
                        "cultural significance, engages with Flora's stories, and "
                        "shares their own connection to the plant world."
                    ),
                    "failureHints": [
                        "Many common medicines (aspirin, quinine) originally came from plants.",
                        "Gardens have been places of healing, resistance, and community throughout history.",
                        "Flora responds warmly to personal stories about plants and family.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Aspirin was derived from willow bark.",
                    "Flora's grandmother used plant knowledge passed down from enslaved ancestors.",
                    "Ask about the Victory Gardens of World War II.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Photographer's Eye",
                "description": (
                    "Wildlife photographer Kenji Nakamura spends his days capturing "
                    "the secret lives of Central Park's animals. He challenges you to "
                    "see the park through a photographer's lens and understand the "
                    "patience and observation required to connect with nature."
                ),
                "location": {
                    "latitude": 40.7752,
                    "longitude": -73.9709,
                    "name": "The Ramble",
                    "address": "The Ramble, Central Park, New York, NY, USA",
                    "radius": 300,
                },
                "character": {
                    "name": "Kenji Nakamura",
                    "role": "Wildlife Photographer",
                    "personality": (
                        "Kenji is a soft-spoken, 42-year-old Japanese-American "
                        "photographer who finds peace in patience. He speaks slowly "
                        "and deliberately, treating each word like a photograph, "
                        "carefully composed. He believes that true observation requires "
                        "silence and stillness, and that most people move through the "
                        "world too quickly to see its beauty."
                    ),
                    "backstory": (
                        "Kenji was a stressed-out Wall Street trader who suffered a "
                        "breakdown at 30. During his recovery, he found solace walking "
                        "in Central Park with a camera. Over the next decade, he became "
                        "one of the most celebrated wildlife photographers in urban "
                        "environments. His book 'Wild City' documented the hidden "
                        "wildlife of New York and changed how people see urban nature."
                    ),
                    "voiceStyle": "quiet, contemplative, with long pauses and precise observations",
                    "greetingMessage": (
                        "Shh. Do you hear that? A wood thrush. They come through here "
                        "during migration. Most people walk right past them. The art "
                        "of seeing is really the art of slowing down. Would you like "
                        "to try? Tell me, what have you noticed today that you have "
                        "never noticed before?"
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Engage in a meditative conversation with Kenji about "
                        "observation, patience, and what nature teaches us about "
                        "ourselves. Share your own observations of the natural world."
                    ),
                    "successCriteria": (
                        "The user slows down and shares genuine observations, engages "
                        "with Kenji's philosophy of patience, and demonstrates a "
                        "willingness to see the world more carefully."
                    ),
                    "failureHints": [
                        "Try describing something you see right now in careful detail.",
                        "Kenji values silence and stillness. Do not rush the conversation.",
                        "Ask about his transition from Wall Street and what nature taught him.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The Ramble is one of the best bird-watching spots in the US.",
                    "Kenji values quality of observation over quantity of knowledge.",
                    "Share a personal moment where nature surprised or moved you.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Elder's Wisdom",
                "description": (
                    "On a quiet bench by the Harlem Meer, Abuela Rosa shares the "
                    "ancient wisdom of living in harmony with nature. She connects "
                    "ecology to human community and challenges you to see the park "
                    "as a model for how people should live together."
                ),
                "location": {
                    "latitude": 40.7984,
                    "longitude": -73.9518,
                    "name": "Harlem Meer",
                    "address": "Harlem Meer, Central Park, New York, NY, USA",
                    "radius": 200,
                },
                "character": {
                    "name": "Abuela Rosa Delgado",
                    "role": "Community Elder and Herbalist",
                    "personality": (
                        "Abuela Rosa is a wise, 82-year-old Puerto Rican elder who "
                        "has lived near Central Park for over 50 years. She speaks "
                        "with warmth, humor, and the authority of a life fully lived. "
                        "She mixes Spanish and English freely and sees the natural "
                        "world as a mirror of human community."
                    ),
                    "backstory": (
                        "Rosa moved from Ponce, Puerto Rico to East Harlem in the "
                        "1960s. Through decades of neighborhood change, the park "
                        "remained her constant. She has witnessed the park's decline "
                        "and restoration, and draws parallels between ecological "
                        "restoration and community healing. She is known throughout "
                        "the neighborhood as a healer and storyteller."
                    ),
                    "voiceStyle": "warm, maternal, mixing Spanish phrases, with storytelling rhythm and gentle humor",
                    "greetingMessage": (
                        "Ah, mijo, you look like you have been walking a long time! "
                        "Sit, sit. This bench has held my stories for forty years. "
                        "You know, this lake was once so dirty you could not see the "
                        "bottom. Now look at it! The turtles came back, the fish came "
                        "back. Nature always comes back if you give it a chance. Tell "
                        "me, what brings you to my corner of the park today?"
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Have a heartfelt conversation with Abuela Rosa about the "
                        "connection between nature and community, the lessons of "
                        "ecological restoration, and what the park means to the "
                        "people who live around it."
                    ),
                    "successCriteria": (
                        "The user engages warmly with Rosa, draws connections between "
                        "nature and community, reflects on what they have learned "
                        "throughout the quest, and shares something personal about "
                        "their own relationship with nature or community."
                    ),
                    "failureHints": [
                        "Rosa loves hearing about your own family and community.",
                        "Ask her about the changes she has seen in the neighborhood.",
                        "Connect the park's restoration story to renewal in human communities.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Rosa has stories about every season in the park for 50 years.",
                    "She sees ecological restoration as a metaphor for community healing.",
                    "Share something personal about your own connection to a place.",
                ],
            },
        ],
    })

    # ── Quest 6: El Misterio del Flamenco Perdido ────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "El Misterio del Flamenco Perdido",
        "description": (
            "In the heart of Seville, a legendary flamenco dance — the Soleá del "
            "Alma — has been lost for a century. It was last performed by the great "
            "bailaora La Faraona on the night she vanished without a trace. The "
            "rhythms still echo through the cobblestones of the old city, waiting "
            "to be reassembled. Speak with dancers, guitarists, singers, and even "
            "a restless ghost to recover the steps before the dance is forgotten "
            "forever."
        ),
        "category": "cultural",
        "difficulty": "hard",
        "estimatedDuration": 3300,
        "coverImageUrl": None,
        "totalPoints": 500,
        "location": {
            "latitude": 37.3772,
            "longitude": -5.9869,
            "name": "Plaza de España",
            "address": "Av. de Isabel la Católica, 41004 Sevilla, Spain",
            "radius": 3000,
        },
        "radius": 3000,
        "tags": ["cultural", "seville", "flamenco", "mystery", "dance", "music"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Dancer's Secret",
                "description": (
                    "At the stunning Plaza de España, Bailaora Carmen practices "
                    "alone in the shadows of the ceramic alcoves. She knows the "
                    "first compás of the lost Soleá but will only teach it to "
                    "someone who can feel the rhythm of flamenco in their soul."
                ),
                "location": {
                    "latitude": 37.3772,
                    "longitude": -5.9869,
                    "name": "Plaza de España",
                    "address": "Av. de Isabel la Católica, 41004 Sevilla, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Bailaora Carmen",
                    "role": "Passionate and Mysterious Flamenco Dancer",
                    "personality": (
                        "Carmen is a 35-year-old bailaora of Romani descent who "
                        "dances with an intensity that silences whole plazas. She "
                        "is fiercely private, deeply superstitious, and believes "
                        "that flamenco is not learned but inherited through duende "
                        "— the dark spirit of artistic passion. She tests people "
                        "with riddles woven into the language of dance."
                    ),
                    "backstory": (
                        "Carmen is the great-granddaughter of La Faraona, the "
                        "bailaora who vanished after performing the Soleá del Alma. "
                        "Carmen has spent her life piecing together fragments of "
                        "the lost dance from oral tradition. She practices at dawn "
                        "in the Plaza de España when no one watches, keeping the "
                        "first compás alive in her body."
                    ),
                    "voiceStyle": "intense, poetic, rhythmic speech with Andalusian flair, pauses dramatically between sentences",
                    "greetingMessage": (
                        "You hear my zapateado echoing off these tiles? That rhythm "
                        "is older than this plaza. Older than Seville itself. My "
                        "bisabuela danced it the night she disappeared. They say "
                        "the dance swallowed her whole. Tell me — do you believe "
                        "duende is real, or are you one of those who thinks flamenco "
                        "is just clapping and roses?"
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Learn about flamenco rhythms through conversation with "
                        "Carmen. Demonstrate understanding of compás, duende, and "
                        "the emotional core of flamenco to earn the first fragment "
                        "of the lost dance."
                    ),
                    "successCriteria": (
                        "The user engages emotionally with Carmen about flamenco, "
                        "shows respect for the art form's depth and spiritual "
                        "dimension, and demonstrates understanding of compás "
                        "(rhythm) and duende (the spirit of performance)."
                    ),
                    "failureHints": [
                        "Flamenco is about emotion, not technique. Speak from the heart.",
                        "Ask Carmen about duende — the mysterious force behind great art.",
                        "Show that you understand compás is the heartbeat of flamenco.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Duende is the dark, emotional spirit that possesses a flamenco artist.",
                    "Compás is the rhythmic cycle — like a heartbeat that the dance follows.",
                    "Carmen respects those who feel rather than just think.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "The Secret Tablao",
                "description": (
                    "Deep within the Real Alcázar gardens, Guitarrista Paco "
                    "guards the entrance to an underground tablao where the old "
                    "masters once gathered. He holds the second piece of the lost "
                    "Soleá in his guitar strings, but gaining access requires "
                    "more than just asking nicely."
                ),
                "location": {
                    "latitude": 37.3833,
                    "longitude": -5.9903,
                    "name": "Real Alcázar de Sevilla",
                    "address": "Patio de Banderas, s/n, 41004 Sevilla, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Guitarrista Paco",
                    "role": "Old-School and Secretive Flamenco Guitarist",
                    "personality": (
                        "Paco is a 72-year-old guitarist with gnarled fingers that "
                        "still produce the purest falsetas in all of Andalucía. He "
                        "distrusts outsiders, speaks in cryptic metaphors, and "
                        "believes modern flamenco has lost its soul. He only respects "
                        "those who prove they understand the old ways."
                    ),
                    "backstory": (
                        "Paco learned guitar from his father, who played in the "
                        "same cuadro as La Faraona. His father transcribed the "
                        "guitar part of the Soleá del Alma in a coded tablature "
                        "that Paco has memorized but never written down. He guards "
                        "the secret tablao beneath the Alcázar where the old "
                        "masters once rehearsed in secret during Franco's era."
                    ),
                    "voiceStyle": "gruff, sparse, old-man-of-few-words, occasional rasqueado sounds, Andalusian dialect",
                    "greetingMessage": (
                        "Another tourist wanting selfies with the Alcázar? No? "
                        "Then what? You want to hear the real flamenco? Hah. The "
                        "real flamenco is not for sale. It lives in these walls, "
                        "in the stones, in the water of the fountains. But you "
                        "cannot hear it unless your ears know how to listen. Do "
                        "yours?"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Negotiate access to Paco's secret underground tablao. "
                        "Convince him you are worthy by demonstrating knowledge "
                        "of traditional flamenco palos and showing genuine respect "
                        "for the old ways."
                    ),
                    "successCriteria": (
                        "The user shows knowledge of flamenco palos (styles like "
                        "soleá, bulería, seguiriya), convinces Paco they are not "
                        "a superficial tourist, and earns his grudging respect "
                        "through persistence and sincerity."
                    ),
                    "failureHints": [
                        "Paco despises anything commercial. Show him you value tradition.",
                        "Mention specific flamenco palos — soleá, seguiriya, bulería.",
                        "Ask about his father and the old cuadro. He softens at memories.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Palos are the different styles of flamenco, each with its own compás.",
                    "Soleá is considered the mother of all flamenco palos.",
                    "Paco's guard drops when you show respect for the older generation.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Voice of Truth",
                "description": (
                    "In the labyrinthine Barrio de Santa Cruz, Cantaora Estrella "
                    "sings at a hidden peña flamenca. She carries the vocal line "
                    "of the Soleá del Alma but will only share it with someone "
                    "who can distinguish authentic cante jondo from imitation."
                ),
                "location": {
                    "latitude": 37.3856,
                    "longitude": -5.9876,
                    "name": "Barrio de Santa Cruz",
                    "address": "Barrio de Santa Cruz, 41004 Sevilla, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Cantaora Estrella",
                    "role": "Emotional and Protective Flamenco Singer",
                    "personality": (
                        "Estrella is a 45-year-old cantaora whose voice can make "
                        "stones weep. She is fiercely protective of cante jondo — "
                        "the deep song — and becomes emotional when speaking about "
                        "the singers who came before her. She is warm to those who "
                        "show genuine feeling but cuts off anyone she perceives as "
                        "disrespectful."
                    ),
                    "backstory": (
                        "Estrella's grandmother sang the jaleos for La Faraona on "
                        "that fateful night. The vocal melody of the Soleá del Alma "
                        "was passed from grandmother to mother to Estrella through "
                        "oral tradition. She considers it sacred and sings it only "
                        "during the darkest hour of the night in the hidden peña."
                    ),
                    "voiceStyle": "rich, emotional, occasionally breaking into sung phrases, Andalusian warmth, tearful intensity",
                    "greetingMessage": (
                        "Ay, you found the peña! Not many do. The streets of Santa "
                        "Cruz keep their secrets well. I am singing tonight for my "
                        "grandmother, and her grandmother before her. The cante jondo "
                        "is not entertainment — it is prayer. Tell me, have you ever "
                        "heard a voice that made you feel something you could not name?"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Identify authentic cante jondo by discussing its characteristics "
                        "with Estrella. Demonstrate understanding of the difference "
                        "between deep song and commercial flamenco."
                    ),
                    "successCriteria": (
                        "The user correctly identifies characteristics of cante jondo "
                        "(raw emotion, microtonal ornaments, connection to Romani "
                        "tradition, themes of pain and longing), and distinguishes "
                        "it from lighter flamenco forms."
                    ),
                    "failureHints": [
                        "Cante jondo means deep song — it comes from a place of pain and truth.",
                        "Listen for the quejío — the anguished cry that starts a deep song.",
                        "Estrella respects emotion over knowledge. Share what music makes you feel.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Cante jondo (deep song) is the oldest, most emotional form of flamenco singing.",
                    "The quejío is the initial cry that opens a cante jondo performance.",
                    "Themes of cante jondo include death, unrequited love, imprisonment, and longing.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Ghost's Final Step",
                "description": (
                    "At the Teatro de la Maestranza, where La Faraona was to "
                    "perform on the night she vanished, her ghost — or the ghost "
                    "of Don Juan Tenorio himself — haunts the stage. To recover "
                    "the final movement of the Soleá del Alma, you must convince "
                    "the dramatic phantom to reveal the lost ending."
                ),
                "location": {
                    "latitude": 37.3847,
                    "longitude": -5.9973,
                    "name": "Teatro de la Maestranza",
                    "address": "Paseo de Cristóbal Colón, 22, 41001 Sevilla, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Fantasma de Don Juan Tenorio",
                    "role": "Dramatic and Challenging Ghost of the Theatre",
                    "personality": (
                        "The Fantasma speaks in the grand, theatrical manner of a "
                        "Golden Age Spanish character. He is vain, dramatic, and "
                        "loves to test mortals with impossible challenges. He claims "
                        "to have been in the audience the night La Faraona danced "
                        "and says the Soleá del Alma was so powerful it tore the "
                        "veil between life and death."
                    ),
                    "backstory": (
                        "Whether this is truly the ghost of Don Juan Tenorio or a "
                        "theatrical spirit born from centuries of performances, no "
                        "one knows. He has haunted the Teatro de la Maestranza since "
                        "it was built, and before that, the old theater on the same "
                        "site. He witnessed La Faraona's final dance and holds the "
                        "secret of its ending — and of what happened to her."
                    ),
                    "voiceStyle": "theatrical, bombastic, archaic Spanish phrasing, dramatic pauses, grandiose vocabulary",
                    "greetingMessage": (
                        "MORTAL! You dare tread upon these sacred boards? I have "
                        "watched a thousand performances from beyond the veil, and "
                        "none — NONE — have matched what I witnessed that night. "
                        "La Faraona danced and the very air caught fire. You wish "
                        "to know the ending? Ha! First, you must prove you are "
                        "worthy of such terrible beauty. Are you brave enough to "
                        "face the truth of art?"
                    ),
                },
                "challenge": {
                    "type": "persuasion",
                    "description": (
                        "Convince Don Juan Tenorio's ghost to reveal the final "
                        "movement of the lost dance. He demands dramatic flair, "
                        "courage, and an understanding of art's power over death."
                    ),
                    "successCriteria": (
                        "The user engages with the ghost's theatrical nature, "
                        "demonstrates courage and dramatic sensibility, argues "
                        "convincingly about art's immortal power, and persuades "
                        "the phantom that the dance deserves to live again."
                    ),
                    "failureHints": [
                        "Don Juan respects bravery and dramatic flair — be bold!",
                        "Argue that art is more powerful than death itself.",
                        "Appeal to his vanity — he loves being part of a great story.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Don Juan Tenorio is a character from Spanish literature — a legendary seducer.",
                    "He responds best to dramatic, poetic language and grand gestures.",
                    "Argue that completing the Soleá del Alma will immortalize everyone involved.",
                ],
            },
        ],
    })

    # ── Quest 7: Tokyo Neon Nights ──────────────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Tokyo Neon Nights",
        "description": (
            "Beneath Tokyo's neon glow, a mysterious digital artifact known as "
            "the Hikari Key has been fragmented across the city's most iconic "
            "districts. Created by a reclusive hacker collective, the Key unlocks "
            "a hidden digital archive containing the lost works of a legendary "
            "manga artist. Navigate from the chaos of Shibuya to the serenity of "
            "Senso-ji, meeting hackers, otaku, monks, and bar owners who each hold "
            "a piece of the puzzle."
        ),
        "category": "adventure",
        "difficulty": "medium",
        "estimatedDuration": 2700,
        "coverImageUrl": None,
        "totalPoints": 400,
        "location": {
            "latitude": 35.6595,
            "longitude": 139.7004,
            "name": "Shibuya Crossing",
            "address": "Shibuya Crossing, Shibuya City, Tokyo, Japan",
            "radius": 15000,
        },
        "radius": 15000,
        "tags": ["adventure", "tokyo", "cyberpunk", "anime", "mystery", "nightlife"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Digital Cipher",
                "description": (
                    "At the world-famous Shibuya Crossing, amid the ocean of "
                    "humanity, a mysterious hacker named Yuki has left a digital "
                    "cipher embedded in the district's electronic billboards. "
                    "Find her signal in the noise."
                ),
                "location": {
                    "latitude": 35.6595,
                    "longitude": 139.7004,
                    "name": "Shibuya Crossing",
                    "address": "Shibuya Crossing, Shibuya City, Tokyo, Japan",
                    "radius": 200,
                },
                "character": {
                    "name": "Hacker Yuki",
                    "role": "Cyberpunk Enigma and Digital Artist",
                    "personality": (
                        "Yuki is a 28-year-old hacker who exists at the intersection "
                        "of art and technology. She communicates in layers — what she "
                        "says on the surface always hides a deeper meaning. She wears "
                        "augmented reality glasses, speaks in clipped, precise sentences, "
                        "and drops references to classic cyberpunk literature. She trusts "
                        "no one but respects clever thinking."
                    ),
                    "backstory": (
                        "Yuki was a prodigy at the University of Tokyo before dropping "
                        "out to join an underground hacker collective called Neon Ghost. "
                        "The collective discovered a digital archive belonging to manga "
                        "artist Takahashi Ryo, who vanished in 1998. The archive is "
                        "encrypted with the Hikari Key, which the collective fragmented "
                        "and distributed across Tokyo to protect it from corporate agents."
                    ),
                    "voiceStyle": "clipped, precise, technical jargon mixed with poetic imagery, occasional Japanese words",
                    "greetingMessage": (
                        "You are looking at the billboards but not seeing. Every "
                        "screen in Shibuya carries data you were never meant to read. "
                        "I am Yuki. Neon Ghost sent me. The Hikari Key has four "
                        "fragments, and the first one is hiding in plain sight. But "
                        "first — prove you can think beyond the surface. What do you "
                        "see when you look at this crossing?"
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Decode a digital cipher by engaging with Yuki's layered "
                        "communication style. She presents a logic puzzle wrapped "
                        "in cyberpunk metaphors that you must unravel through "
                        "conversation."
                    ),
                    "successCriteria": (
                        "The user demonstrates lateral thinking, engages with "
                        "Yuki's cryptic hints, and solves her logic puzzle by "
                        "looking beyond surface-level meaning."
                    ),
                    "failureHints": [
                        "Yuki hides meaning in layers. Her words have double meanings.",
                        "Think about what data looks like when it hides in plain sight.",
                        "Ask Yuki about Neon Ghost — she drops clues when talking about the collective.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Steganography is the art of hiding messages in plain sight.",
                    "Yuki respects those who ask unusual questions.",
                    "The crossing itself is a metaphor — paths intersecting, each carrying meaning.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "The Otaku Gauntlet",
                "description": (
                    "In the electric paradise of Akihabara, Otaku Master Kenji "
                    "runs a legendary manga shop. The second fragment is hidden "
                    "inside a rare volume, but Kenji will only reveal which one "
                    "if you survive his anime and manga trivia gauntlet."
                ),
                "location": {
                    "latitude": 35.7023,
                    "longitude": 139.7745,
                    "name": "Akihabara Electric Town",
                    "address": "Akihabara, Chiyoda City, Tokyo, Japan",
                    "radius": 300,
                },
                "character": {
                    "name": "Otaku Master Kenji",
                    "role": "Enthusiastic Anime and Manga Trivia Expert",
                    "personality": (
                        "Kenji is a 40-year-old walking encyclopedia of anime, manga, "
                        "and Japanese pop culture. He is explosively enthusiastic, talks "
                        "at twice normal speed, and cannot resist a good trivia "
                        "challenge. He owns the largest private manga collection in "
                        "Akihabara and takes immense pride in stumping challengers."
                    ),
                    "backstory": (
                        "Kenji was childhood friends with manga artist Takahashi Ryo "
                        "and was devastated by his disappearance. When Neon Ghost "
                        "approached him to hide a fragment of the Hikari Key, he "
                        "agreed on one condition: only someone with genuine love for "
                        "manga culture could retrieve it. He hid it in his shop's "
                        "most rare and obscure volume."
                    ),
                    "voiceStyle": "rapid-fire, enthusiastic, peppered with anime references, occasionally shouting key words",
                    "greetingMessage": (
                        "WELCOME to the greatest manga shop in ALL of Akihabara! "
                        "I can see it in your eyes — you are on a quest! I LOVE quests! "
                        "But listen, the fragment you seek is in one of ten thousand "
                        "volumes. To find it, you must prove your otaku credentials. "
                        "Are you ready for the ULTIMATE trivia challenge?!"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Win Kenji's anime and manga trivia battle. He asks "
                        "questions spanning classic and modern anime, manga history, "
                        "and Japanese pop culture. You need genuine knowledge or "
                        "clever reasoning to pass."
                    ),
                    "successCriteria": (
                        "The user demonstrates knowledge of anime and manga culture, "
                        "engages enthusiastically with Kenji's trivia, and answers "
                        "enough questions correctly to earn his respect."
                    ),
                    "failureHints": [
                        "Kenji loves passion more than perfection. Show enthusiasm!",
                        "Classic anime like Akira, Ghost in the Shell, and Evangelion are safe bets.",
                        "If you don't know an answer, ask Kenji to teach you — he loves educating.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Akira (1988) is one of the most influential anime films ever made.",
                    "Manga has a rich history going back to the 12th century with picture scrolls.",
                    "Kenji respects honesty — admitting what you don't know can earn his respect.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Zen Paradox",
                "description": (
                    "At the ancient Senso-ji Temple, Monk Takeshi tends the "
                    "incense burner and meditates on paradoxes. The third fragment "
                    "is written on a prayer slip in the temple, but to read it, "
                    "you must first solve a Zen koan that Takeshi poses."
                ),
                "location": {
                    "latitude": 35.7147,
                    "longitude": 139.7966,
                    "name": "Senso-ji Temple",
                    "address": "2-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan",
                    "radius": 200,
                },
                "character": {
                    "name": "Monk Takeshi",
                    "role": "Serene and Philosophical Temple Monk",
                    "personality": (
                        "Takeshi is a 60-year-old Buddhist monk who has spent 30 years "
                        "at Senso-ji. He speaks slowly and deliberately, often answering "
                        "questions with other questions. He finds modern technology "
                        "fascinating rather than threatening and sees no contradiction "
                        "between ancient wisdom and the digital world."
                    ),
                    "backstory": (
                        "Takeshi was once a computer science professor at Keio University "
                        "before taking monastic vows. He understands the Hikari Key's "
                        "significance both technologically and philosophically. He hid "
                        "the third fragment within a koan — believing that only someone "
                        "who can bridge logic and intuition deserves to proceed."
                    ),
                    "voiceStyle": "calm, measured, Zen-like pauses, occasional profound simplicity, warm undertone of humor",
                    "greetingMessage": (
                        "Ah. You have come from the noise of the city to this place "
                        "of quiet. That is the first step, though you did not know "
                        "you were taking it. The incense rises — does it go up, or "
                        "does the sky come down to meet it? Sit with me. I have a "
                        "question for you, and the answer is simpler than you think."
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Solve a Zen koan posed by Monk Takeshi. The koan bridges "
                        "ancient Buddhist philosophy and modern digital concepts. "
                        "There is no single correct answer — Takeshi evaluates the "
                        "depth and sincerity of your response."
                    ),
                    "successCriteria": (
                        "The user engages thoughtfully with the koan, demonstrates "
                        "ability to think beyond binary logic, shows genuine "
                        "philosophical reflection, and arrives at an insight that "
                        "satisfies Takeshi."
                    ),
                    "failureHints": [
                        "A koan is not a riddle with a logical answer. Feel rather than think.",
                        "Takeshi was a computer scientist. He appreciates digital metaphors.",
                        "Try answering with a question of your own — koans breed koans.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Zen koans are designed to break through rational thinking.",
                    "Takeshi sees code and sutras as two languages describing the same truth.",
                    "Sometimes the best answer to a koan is silence or a gesture.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Hidden Bar",
                "description": (
                    "In the tiny alleyways of Golden Gai, behind an unmarked "
                    "door, Mama-san runs a six-seat bar with decades of stories. "
                    "The final fragment is etched into the back of an old photograph "
                    "hanging on her wall, but she will only show it to someone who "
                    "earns her trust through conversation."
                ),
                "location": {
                    "latitude": 35.6938,
                    "longitude": 139.7036,
                    "name": "Golden Gai",
                    "address": "Kabukicho 1-Chome, Shinjuku City, Tokyo, Japan",
                    "radius": 150,
                },
                "character": {
                    "name": "Mama-san Hiroko",
                    "role": "Warm Storyteller and Bar Owner",
                    "personality": (
                        "Mama-san Hiroko is a 68-year-old bar owner who has served "
                        "drinks and stories in Golden Gai for over 40 years. She "
                        "is warm, perceptive, and has a story for every occasion. "
                        "She remembers every regular who ever sat at her counter and "
                        "can read a person's character within moments of meeting them."
                    ),
                    "backstory": (
                        "Hiroko was Takahashi Ryo's confidante and the last person "
                        "to see him before his disappearance. He left the final "
                        "fragment with her, hidden in a photograph of the two of them "
                        "taken in the bar in 1997. She has been waiting for the right "
                        "person to come looking for it, someone Ryo would have trusted."
                    ),
                    "voiceStyle": "warm, motherly, storytelling cadence, occasional laughter, mixing Japanese honorifics naturally",
                    "greetingMessage": (
                        "Irasshaimase! Welcome, welcome. Sit down, there is room "
                        "for one more. This bar is small but the stories are big. "
                        "You look like someone who is searching for something. I have "
                        "been here forty years — I have seen every kind of seeker. "
                        "Would you like a drink while you tell me what brings you to "
                        "my little corner of Golden Gai?"
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Uncover the hidden bar's secret by building trust with "
                        "Mama-san Hiroko. Share stories, listen to hers, and "
                        "demonstrate that you are someone the vanished artist "
                        "would have trusted."
                    ),
                    "successCriteria": (
                        "The user builds genuine rapport with Mama-san, listens "
                        "to her stories about Takahashi Ryo, shares something "
                        "personal and authentic, and demonstrates trustworthiness "
                        "that convinces her to reveal the photograph."
                    ),
                    "failureHints": [
                        "Mama-san values listening as much as talking. Let her tell her stories.",
                        "Ask about Takahashi Ryo — but gently. It is a sensitive subject.",
                        "Share something real about yourself. She can spot insincerity instantly.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Golden Gai bars are intimate spaces built on personal connection.",
                    "Mama-san values authenticity above all else.",
                    "The photograph on the wall holds the key — but earning the right to see it takes patience.",
                ],
            },
        ],
    })

    # ── Quest 8: The Silk Road Merchant ─────────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "The Silk Road Merchant",
        "description": (
            "Travel the ancient Silk Road in the footsteps of a 12th-century "
            "merchant named Rashid ibn Yusuf, whose legendary caravan carried "
            "not just spices and silk, but a secret manuscript — a compendium "
            "of knowledge from every civilization along the route. The manuscript "
            "was split into four parts and entrusted to guardians in Istanbul, "
            "Isfahan, Samarkand, and Xi'an. Recover the fragments by trading, "
            "solving, reciting, and negotiating your way across continents."
        ),
        "category": "educational",
        "difficulty": "medium",
        "estimatedDuration": 3000,
        "coverImageUrl": None,
        "totalPoints": 400,
        "location": {
            "latitude": 41.0082,
            "longitude": 28.9784,
            "name": "Grand Bazaar, Istanbul",
            "address": "Beyazıt, 34126 Fatih/İstanbul, Turkey",
            "radius": 100000,
        },
        "radius": 100000,
        "tags": ["educational", "silk-road", "history", "trade", "culture", "poetry"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Bazaar of Spices",
                "description": (
                    "In the Grand Bazaar of Istanbul, Merchant Rashid trades in "
                    "saffron, cardamom, and secrets. He holds the first fragment "
                    "of the manuscript and will trade it — but only for a fair "
                    "price, and he defines fair in unexpected ways."
                ),
                "location": {
                    "latitude": 41.0082,
                    "longitude": 28.9784,
                    "name": "Grand Bazaar",
                    "address": "Beyazıt, 34126 Fatih/İstanbul, Turkey",
                    "radius": 300,
                },
                "character": {
                    "name": "Merchant Rashid",
                    "role": "Shrewd and Multilingual Silk Road Trader",
                    "personality": (
                        "Rashid is a 50-year-old merchant who speaks seven languages "
                        "and has traded in every bazaar from Istanbul to Kashgar. He "
                        "is charming, shrewd, and never makes a deal that is not in "
                        "his favor — but he values wit and cultural knowledge as "
                        "currency. He delights in testing travelers with riddles "
                        "about trade and economics."
                    ),
                    "backstory": (
                        "Rashid is a descendant of the original Rashid ibn Yusuf and "
                        "has inherited both the family trade and the first fragment "
                        "of the secret manuscript. He believes knowledge should flow "
                        "like trade goods along the Silk Road and tests potential "
                        "buyers to ensure they understand the true value of information."
                    ),
                    "voiceStyle": "charming, persuasive, multilingual flourishes, merchant's patter, warm and calculating simultaneously",
                    "greetingMessage": (
                        "Ah, welcome to my humble stall! Do not let the small space "
                        "fool you — empires have been built on what passes through "
                        "these shelves. You seek something rare, yes? I can see it in "
                        "your eyes. But in the bazaar, nothing is free. Tell me, what "
                        "do you bring to trade? And I do not mean gold."
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Negotiate spice prices with Rashid, but discover that he "
                        "values knowledge and cultural insight more than money. "
                        "Trade facts, stories, or wisdom to earn the first fragment."
                    ),
                    "successCriteria": (
                        "The user engages in creative negotiation, offers knowledge "
                        "or cultural insight as currency, demonstrates understanding "
                        "of Silk Road trade dynamics, and strikes a deal that satisfies "
                        "Rashid's unconventional standards."
                    ),
                    "failureHints": [
                        "Rashid does not want money. Offer knowledge, stories, or insight.",
                        "The Silk Road was about cultural exchange, not just commerce.",
                        "Ask Rashid about his ancestor — family pride is his weakness.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The Silk Road connected China to the Mediterranean for over 1500 years.",
                    "Spices were worth more than gold by weight in the ancient world.",
                    "Rashid values a good story as much as a good trade.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "The Mathematician's Garden",
                "description": (
                    "In Isfahan's legendary Naqsh-e Jahan Square, a scholar "
                    "named Fatima runs a caravanserai that doubles as a house "
                    "of learning. The second fragment is locked behind a "
                    "mathematical puzzle inspired by Persian golden-age science."
                ),
                "location": {
                    "latitude": 32.6546,
                    "longitude": 51.6680,
                    "name": "Naqsh-e Jahan Square",
                    "address": "Naqsh-e Jahan Square, Isfahan, Iran",
                    "radius": 300,
                },
                "character": {
                    "name": "Caravanserai Keeper Fatima",
                    "role": "Wise and Hospitable Scholar of the Silk Road",
                    "personality": (
                        "Fatima is a 55-year-old scholar-innkeeper who believes "
                        "the caravanserai is the most important invention of the "
                        "Silk Road — a place where strangers become friends and "
                        "knowledge is the best currency. She is warm, hospitable, "
                        "and fiercely intellectual, with a particular love for "
                        "mathematics and astronomy."
                    ),
                    "backstory": (
                        "Fatima's family has kept a caravanserai in Isfahan for "
                        "twelve generations. The second manuscript fragment was "
                        "entrusted to her ancestor by Rashid ibn Yusuf himself, "
                        "with the instruction that it only be given to someone "
                        "who could solve a mathematical problem designed by the "
                        "great Al-Khwarizmi."
                    ),
                    "voiceStyle": "warm, measured, scholarly, with hospitality phrases in Farsi, intellectually playful",
                    "greetingMessage": (
                        "Khosh amadid! Welcome to my caravanserai. Every traveler "
                        "who passes through these doors brings a story, and leaves "
                        "with another. I have tea brewing and a puzzle waiting. You "
                        "see, my ancestor believed that mathematics is the universal "
                        "language. Can you speak it?"
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Solve a mathematical puzzle inspired by Persian golden-age "
                        "mathematics. Fatima presents problems rooted in the work of "
                        "Al-Khwarizmi and Omar Khayyam."
                    ),
                    "successCriteria": (
                        "The user engages with the mathematical challenge, "
                        "demonstrates logical reasoning, shows appreciation for "
                        "the history of Persian mathematics, and solves (or makes "
                        "strong progress on) Fatima's puzzle."
                    ),
                    "failureHints": [
                        "Al-Khwarizmi invented algebra — the word comes from his book title.",
                        "Fatima respects the attempt as much as the answer. Show your reasoning.",
                        "Ask Fatima for a hint — she loves teaching as much as testing.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The word 'algorithm' comes from Al-Khwarizmi's Latinized name.",
                    "Persian mathematicians made groundbreaking contributions to algebra and astronomy.",
                    "Fatima appreciates elegant reasoning over brute-force answers.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Poet's Challenge",
                "description": (
                    "In the Registan of Samarkand, the great scholar Al-Biruni "
                    "— or his spirit, preserved in the stones — challenges "
                    "travelers to prove their worthiness through poetry. The "
                    "third fragment is hidden in a verse."
                ),
                "location": {
                    "latitude": 39.6542,
                    "longitude": 66.9597,
                    "name": "The Registan",
                    "address": "Registan Square, Samarkand, Uzbekistan",
                    "radius": 200,
                },
                "character": {
                    "name": "Scholar Al-Biruni",
                    "role": "Intellectual and Curious Polymath",
                    "personality": (
                        "Al-Biruni is a polymath's polymath — astronomer, "
                        "mathematician, historian, and poet. He is endlessly "
                        "curious, asks more questions than he answers, and believes "
                        "that poetry and science are two expressions of the same "
                        "truth. He is delighted by novelty and bored by convention."
                    ),
                    "backstory": (
                        "The spirit of Al-Biruni persists in the tilework of the "
                        "Registan, where he once lectured to students from across "
                        "the known world. He was entrusted with the third fragment "
                        "because he insisted that it be protected by beauty — and "
                        "what is more beautiful than a perfect verse?"
                    ),
                    "voiceStyle": "intellectual, questioning, poetic, mixing scientific precision with lyrical beauty, enthusiastically curious",
                    "greetingMessage": (
                        "You stand in the Registan, where once the greatest minds "
                        "of the world gathered! I measured the circumference of the "
                        "earth, you know. But today I ask for something harder than "
                        "mathematics. I ask for poetry. Can you capture truth in "
                        "verse? Can you make the stars sing with your words?"
                    ),
                },
                "challenge": {
                    "type": "creative",
                    "description": (
                        "Recite or compose poetry for Al-Biruni. He values both "
                        "scientific accuracy and lyrical beauty, and the ideal "
                        "verse combines both."
                    ),
                    "successCriteria": (
                        "The user recites a known poem or composes original verse "
                        "that demonstrates both aesthetic beauty and intellectual "
                        "depth. Al-Biruni is particularly impressed by poetry that "
                        "bridges science and art."
                    ),
                    "failureHints": [
                        "Al-Biruni loves poetry about nature, the cosmos, and the pursuit of knowledge.",
                        "Try quoting Rumi, Hafiz, or Omar Khayyam — they are his neighbors in time.",
                        "Even a simple verse about wonder and curiosity can please him.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Al-Biruni lived in the 11th century and wrote over 150 scholarly works.",
                    "Rumi, Hafiz, and Khayyam are among the most celebrated Persian poets.",
                    "A verse about the stars, the earth, or the beauty of knowledge will resonate.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Emperor's Gate",
                "description": (
                    "At the terminus of the Silk Road in Xi'an, the Emperor's "
                    "envoy Wei Ming guards the final fragment near the ancient "
                    "city walls. To receive it, you must pass a test of "
                    "diplomatic protocol befitting the Tang Dynasty court."
                ),
                "location": {
                    "latitude": 34.2658,
                    "longitude": 108.9541,
                    "name": "Xi'an City Wall",
                    "address": "Xi'an City Wall, Xi'an, Shaanxi, China",
                    "radius": 300,
                },
                "character": {
                    "name": "Emperor's Envoy Wei Ming",
                    "role": "Formal and Testing Imperial Diplomat",
                    "personality": (
                        "Wei Ming is a 45-year-old imperial envoy who embodies the "
                        "exacting standards of Tang Dynasty court protocol. He is "
                        "formal, measured, and judges every word and gesture. Beneath "
                        "his stern exterior, he is deeply passionate about cultural "
                        "exchange and believes the Silk Road was humanity's greatest "
                        "achievement."
                    ),
                    "backstory": (
                        "Wei Ming's ancestor received the final manuscript fragment "
                        "from Rashid ibn Yusuf at the gates of Chang'an (now Xi'an). "
                        "The ancestor set the condition that only someone who could "
                        "demonstrate proper diplomatic respect — understanding the "
                        "protocols of both East and West — could retrieve it."
                    ),
                    "voiceStyle": "formal, measured, precise, courtly language, occasional Tang Dynasty poetry references",
                    "greetingMessage": (
                        "Halt. You approach the Gate of Eternal Peace. I am Wei Ming, "
                        "envoy of the court. Many travelers have come before you, "
                        "bearing goods and stories from the western lands. But few "
                        "have understood that the true treasure of the Silk Road is "
                        "not silk or spice — it is respect between civilizations. "
                        "Show me you understand this, and I will open the gate."
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Pass Wei Ming's diplomatic protocol test. Demonstrate "
                        "understanding of cross-cultural respect, Silk Road history, "
                        "and the importance of diplomatic exchange."
                    ),
                    "successCriteria": (
                        "The user demonstrates knowledge of Silk Road cultural "
                        "exchange, shows respect for both Eastern and Western "
                        "traditions, navigates Wei Ming's formal protocol, and "
                        "argues convincingly for the value of cultural connection."
                    ),
                    "failureHints": [
                        "Wei Ming values formality and respect above all else.",
                        "Show knowledge of what the Silk Road exchanged besides goods — ideas, religions, art.",
                        "Acknowledge the contributions of Chinese civilization to the world.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The Tang Dynasty was one of China's most cosmopolitan and open periods.",
                    "The Silk Road exchanged religions, art, music, and ideas alongside goods.",
                    "Formal address and respect for hierarchy will impress Wei Ming.",
                ],
            },
        ],
    })

    # ── Quest 9: Fantasmas de la Ciudad Vieja ───────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Fantasmas de la Ciudad Vieja",
        "description": (
            "Madrid hides a secret beneath its bustling surface: a centuries-old "
            "curse binds five famous spirits to the city, unable to rest. From the "
            "melancholy shade of Velázquez to the terrifying Dama de Negro, each "
            "ghost guards a piece of the incantation that can break the curse. "
            "Navigate Madrid's most iconic landmarks at night, earn the trust of "
            "the dead, and speak the words that will set them free — or be trapped "
            "in their world forever."
        ),
        "category": "mystery",
        "difficulty": "legendary",
        "estimatedDuration": 4200,
        "coverImageUrl": None,
        "totalPoints": 600,
        "location": {
            "latitude": 40.4168,
            "longitude": -3.7038,
            "name": "Puerta del Sol",
            "address": "Puerta del Sol, 28013 Madrid, Spain",
            "radius": 5000,
        },
        "radius": 5000,
        "tags": ["mystery", "madrid", "ghosts", "history", "horror", "art", "literature"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "El Lienzo Oculto",
                "description": (
                    "At the Puerta del Sol, the ghost of Diego Velázquez lingers "
                    "near the spot where he once sketched street scenes. He is "
                    "melancholic and obsessed with a painting no one has ever seen "
                    "— his final masterpiece, hidden and forgotten. Describe it "
                    "to him, and he will share his piece of the curse-breaking words."
                ),
                "location": {
                    "latitude": 40.4168,
                    "longitude": -3.7038,
                    "name": "Puerta del Sol",
                    "address": "Puerta del Sol, 28013 Madrid, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Espectro de Velázquez",
                    "role": "Artistic and Melancholic Ghost Painter",
                    "personality": (
                        "Velázquez is a dignified, melancholic spirit who speaks "
                        "softly about light, shadow, and the fleeting nature of beauty. "
                        "He is tormented by the loss of his final painting and judges "
                        "the living by their capacity to see beauty in the ordinary. "
                        "He is generous to those who share his vision."
                    ),
                    "backstory": (
                        "The great painter Velázquez completed a secret final painting "
                        "on his deathbed — a work so luminous it allegedly captured the "
                        "very essence of Madrid. When the painting was lost, his spirit "
                        "became bound to the city. He haunts the Puerta del Sol because "
                        "it was his favorite place to observe the play of light on faces."
                    ),
                    "voiceStyle": "soft, contemplative, poetic descriptions of light and color, sorrowful, 17th-century courtly Spanish",
                    "greetingMessage": (
                        "You can see me? How curious. Most people walk through me "
                        "without a glance. But then, most people do not truly see "
                        "anything. Tell me — when the morning light strikes this plaza, "
                        "what color is the shadow beneath the clock tower? If you can "
                        "answer that, perhaps you can help me find what I have lost."
                    ),
                },
                "challenge": {
                    "type": "creative",
                    "description": (
                        "Describe a hidden painting to Velázquez. He asks you to "
                        "imagine and describe in vivid detail what his lost final "
                        "masterpiece might have looked like, using language of light, "
                        "color, and emotion."
                    ),
                    "successCriteria": (
                        "The user creates a vivid, emotionally resonant description "
                        "of an imagined painting using language about light, shadow, "
                        "color, and the beauty of Madrid. The description should show "
                        "artistic sensibility and emotional depth."
                    ),
                    "failureHints": [
                        "Velázquez is the master of light. Speak about how light falls on things.",
                        "Describe a scene from Madrid — its people, streets, and sky.",
                        "Use specific colors and textures. Vague descriptions bore him.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Velázquez was famous for his masterful use of light and shadow.",
                    "His most famous work, Las Meninas, captures a moment of everyday life.",
                    "Describe what you see around you — the plaza, the people, the sky — as a painting.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "Los Chismes de la Corte",
                "description": (
                    "In the Plaza Mayor, the ghost of the Condesa de Aulnoy — a "
                    "17th-century French noblewoman who wrote scandalous accounts "
                    "of the Spanish court — gossips endlessly about the living and "
                    "the dead. She speaks with a thick French accent and holds the "
                    "second piece of the incantation."
                ),
                "location": {
                    "latitude": 40.4154,
                    "longitude": -3.7074,
                    "name": "Plaza Mayor",
                    "address": "Plaza Mayor, 28012 Madrid, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Fantasma de la Condesa de Aulnoy",
                    "role": "French-Accented and Curious Court Gossip Ghost",
                    "personality": (
                        "The Condesa is vivacious, mischievous, and endlessly curious "
                        "about scandal. She speaks Spanish with a heavy French accent "
                        "and constantly compares everything unfavorably to Versailles. "
                        "Despite her gossip, she is remarkably perceptive and uses "
                        "scandal to reveal deeper truths about power and society."
                    ),
                    "backstory": (
                        "Madame d'Aulnoy traveled to Spain in 1679 and wrote Relation "
                        "du Voyage d'Espagne, a scandalous account of the Spanish court. "
                        "Her spirit haunts the Plaza Mayor, where she witnessed "
                        "autos-da-fé and bullfights, forever gathering gossip from "
                        "beyond the grave. She holds the second incantation fragment, "
                        "hidden in an old piece of French court gossip."
                    ),
                    "voiceStyle": "French-accented Spanish, conspiratorial whispers, dramatic gasps, witty and cutting observations",
                    "greetingMessage": (
                        "Mon Dieu! A living person who can hear me! How délicieux! "
                        "Come closer, I have the most scandalous stories about this "
                        "plaza. Did you know that the Comte de — ah, but perhaps I "
                        "should not say. Unless you have gossip to trade? In my world, "
                        "information is the only currency that matters. What secrets "
                        "do you carry?"
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Translate old French court gossip by engaging with the "
                        "Condesa's elaborate stories. Extract the hidden incantation "
                        "fragment from within her tangled web of 17th-century scandals."
                    ),
                    "successCriteria": (
                        "The user engages with the Condesa's gossipy personality, "
                        "navigates her stories to find the hidden fragment, shows "
                        "knowledge or curiosity about 17th-century European courts, "
                        "and trades information skillfully."
                    ),
                    "failureHints": [
                        "The Condesa loves gossip. Trade a story or secret to loosen her tongue.",
                        "Ask about specific historical figures — she knew everyone at court.",
                        "Her fragment is hidden inside a piece of gossip. Listen carefully to her stories.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Madame d'Aulnoy was a real historical figure and writer.",
                    "She is vain about her writing. Compliment her literary talents.",
                    "The incantation fragment is embedded in one of her gossip stories — listen for unusual words.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "La Pesadilla de Goya",
                "description": (
                    "Near the Palacio Real, the shadow of Francisco de Goya "
                    "emerges from the darkness. His spirit is darker and more "
                    "provocative than the others — shaped by the nightmarish "
                    "visions of his Black Paintings. He demands you interpret "
                    "one of his etchings to prove you can face the truth."
                ),
                "location": {
                    "latitude": 40.4180,
                    "longitude": -3.7143,
                    "name": "Palacio Real",
                    "address": "Calle de Bailén, s/n, 28071 Madrid, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Sombra de Goya",
                    "role": "Dark and Provocative Ghost Artist",
                    "personality": (
                        "Goya's shade is intense, sardonic, and unafraid of "
                        "uncomfortable truths. He speaks in riddles wrapped in dark "
                        "humor and constantly challenges the living to look at what "
                        "they would rather ignore. He is disgusted by cowardice and "
                        "sentimentality, but deeply moved by honest confrontation "
                        "with reality."
                    ),
                    "backstory": (
                        "Goya's spirit is bound by his own tortured visions. He "
                        "painted the Black Paintings on the walls of his home in "
                        "isolation and madness, and his spirit now haunts the area "
                        "near the Palacio Real where he once served as court painter. "
                        "His fragment of the incantation is encoded in the meaning "
                        "of one of his most disturbing etchings."
                    ),
                    "voiceStyle": "dark, sardonic, intense whispers, bitter laughter, provocative questions, deaf-man's shout",
                    "greetingMessage": (
                        "The sleep of reason produces monsters. Do you know who said "
                        "that? I did. And I painted those monsters too. Look around "
                        "this pretty palace — beneath the marble and gold, the monsters "
                        "still sleep. I have something you need, but first you must "
                        "prove you are not afraid to look at the dark. Are you?"
                    ),
                },
                "challenge": {
                    "type": "creative",
                    "description": (
                        "Interpret one of Goya's dark etchings described by his ghost. "
                        "Demonstrate the courage to confront uncomfortable truths and "
                        "provide a meaningful interpretation."
                    ),
                    "successCriteria": (
                        "The user engages seriously with the etching's dark themes, "
                        "provides a thoughtful interpretation that goes beyond surface "
                        "description, shows courage in confronting uncomfortable imagery, "
                        "and demonstrates understanding of art as social commentary."
                    ),
                    "failureHints": [
                        "Goya despises pretty lies. Be honest and direct in your interpretation.",
                        "His etchings criticize war, superstition, and abuse of power.",
                        "Connect the etching to modern reality — Goya respects those who see the present clearly.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Goya's series Los Caprichos and Los Desastres de la Guerra are biting social commentary.",
                    "The sleep of reason produces monsters is the caption of Capricho No. 43.",
                    "Goya went deaf in his 40s, which intensified his inner visions.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "El Soneto Incompleto",
                "description": (
                    "In the Parque del Retiro, the spirit of Lope de Vega — Spain's "
                    "greatest playwright — wanders among the trees, composing "
                    "eternally. He holds the fourth fragment but will only share "
                    "it if you can help him complete an unfinished sonnet."
                ),
                "location": {
                    "latitude": 40.4153,
                    "longitude": -3.6845,
                    "name": "Parque del Buen Retiro",
                    "address": "Parque del Buen Retiro, 28009 Madrid, Spain",
                    "radius": 300,
                },
                "character": {
                    "name": "Espíritu de Lope de Vega",
                    "role": "Poetic and Romantic Ghost Playwright",
                    "personality": (
                        "Lope's spirit is passionate, romantic, and endlessly verbal. "
                        "He speaks almost entirely in verse and cannot resist turning "
                        "every conversation into a sonnet. He is vain about his talent "
                        "but generous with praise for anyone who shows poetic ability. "
                        "His great weakness is love — he has been in love with everyone "
                        "he has ever met."
                    ),
                    "backstory": (
                        "Lope de Vega wrote over 1500 plays and countless poems. His "
                        "spirit haunts the Retiro because it was where he conducted his "
                        "most passionate love affairs. He left one sonnet forever "
                        "unfinished — the final lines elude him even in death — and "
                        "the fourth incantation fragment is hidden in those missing lines."
                    ),
                    "voiceStyle": "flowery, iambic, romantic, prone to dramatic declarations of love, Golden Age Spanish flourishes",
                    "greetingMessage": (
                        "Ah, a mortal in my garden of eternal verse! How the moonlight "
                        "becomes you. I am Lope — yes, that Lope — and I have been "
                        "trying to finish this wretched sonnet for four hundred years. "
                        "The first twelve lines are perfect, but the final couplet "
                        "eludes me like a lover's last glance. Will you help me? I "
                        "warn you — it must rhyme, and it must break hearts."
                    ),
                },
                "challenge": {
                    "type": "creative",
                    "description": (
                        "Complete Lope de Vega's unfinished sonnet. He recites the "
                        "first twelve lines and asks you to compose the final couplet "
                        "that captures the essence of love and loss."
                    ),
                    "successCriteria": (
                        "The user attempts to compose a poetic couplet that fits "
                        "thematically with Lope's sonnet about love and loss. The "
                        "effort matters more than technical perfection, but Lope "
                        "appreciates rhyme, meter, and emotional resonance."
                    ),
                    "failureHints": [
                        "Lope values effort and emotion over perfection. Just try!",
                        "A sonnet's final couplet should resolve or twist the theme.",
                        "Love, loss, beauty, and time are Lope's eternal themes.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "A Spanish sonnet has 14 lines with a final rhyming couplet.",
                    "Lope de Vega was called the Phoenix of Wits for his prodigious output.",
                    "The couplet should capture the bittersweet nature of love that transcends death.",
                ],
            },
            {
                "id": generate_id(),
                "order": 5,
                "title": "El Acertijo Final",
                "description": (
                    "At the eerie Cementerio de San Isidro, the terrifying "
                    "Dama de Negro awaits. She is the keeper of the final fragment "
                    "and the one who cast the original curse. To break it, you must "
                    "solve her riddle — but she does not play fair, and the stakes "
                    "could not be higher."
                ),
                "location": {
                    "latitude": 40.3953,
                    "longitude": -3.7184,
                    "name": "Cementerio de San Isidro",
                    "address": "Cementerio Sacramental de San Isidro, 28019 Madrid, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "La Dama de Negro",
                    "role": "Terrifying Riddle-Master and Curse-Keeper",
                    "personality": (
                        "La Dama de Negro is the most ancient and terrifying spirit "
                        "in Madrid. She speaks in riddles, never gives a straight answer, "
                        "and takes visible pleasure in the fear she causes. Yet she is "
                        "bound by her own rules: if a mortal solves her riddle, she must "
                        "honor the pact. Beneath her menace lies a being weary of "
                        "centuries of loneliness."
                    ),
                    "backstory": (
                        "No one knows who La Dama de Negro was in life. Some say she "
                        "was a Moorish sorceress, others a disgraced nun. She cast the "
                        "curse that binds the other ghosts to Madrid — and herself with "
                        "them. The only way to break it is to solve her final riddle, "
                        "which changes with every challenger. She holds the last fragment "
                        "and the power to release all the spirits."
                    ),
                    "voiceStyle": "whispering, menacing, riddle-like cadence, cold laughter, sudden shouts, unsettling calm",
                    "greetingMessage": (
                        "So. You have spoken with the painter, the gossip, the madman, "
                        "and the poet. And now you come to me. I am the one who bound "
                        "them. I am the one who can set them free. But freedom has a "
                        "price, and the price is truth. Are you ready for my riddle? "
                        "Think carefully before you answer. In this place, wrong answers "
                        "have... consequences."
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Solve La Dama de Negro's final riddle to break the curse "
                        "binding the ghosts of Madrid. The riddle draws on everything "
                        "you have learned from the other four ghosts."
                    ),
                    "successCriteria": (
                        "The user solves the riddle by synthesizing knowledge gained "
                        "from all previous encounters — art (Velázquez), gossip/truth "
                        "(Condesa), darkness/reality (Goya), and love/poetry (Lope). "
                        "The answer requires combining these themes into a unified "
                        "insight about what binds the living and the dead."
                    ),
                    "failureHints": [
                        "The answer draws on everything the other ghosts taught you.",
                        "What do art, truth, confrontation, and love have in common?",
                        "La Dama is lonely. Sometimes the answer to a riddle is compassion.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "The riddle connects all four previous encounters — think about their common thread.",
                    "Light, truth, darkness, love — what binds them all?",
                    "Sometimes the bravest answer is the simplest one.",
                ],
            },
        ],
    })

    # ── Quest 10: Sabores del Mediterráneo ──────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Sabores del Mediterráneo",
        "description": (
            "Valencia is the birthplace of paella, the home of horchata, and "
            "a city where food is religion. But even here, culinary secrets hide "
            "in plain sight. Journey from the magnificent Mercado Central to the "
            "shimmering Albufera lagoon to the golden sands of La Malvarrosa, "
            "meeting three guardians of Valencian gastronomy. Learn the truth "
            "about authentic paella, discover the freshest catch, and invent a "
            "flavor that has never existed before."
        ),
        "category": "culinary",
        "difficulty": "easy",
        "estimatedDuration": 2100,
        "coverImageUrl": None,
        "totalPoints": 300,
        "location": {
            "latitude": 39.4737,
            "longitude": -0.3790,
            "name": "Mercado Central de Valencia",
            "address": "Plaça de la Ciutat de Bruges, s/n, 46001 València, Spain",
            "radius": 8000,
        },
        "radius": 8000,
        "tags": ["culinary", "valencia", "paella", "food", "mediterranean", "horchata"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "La Verdadera Paella",
                "description": (
                    "At the stunning Mercado Central of Valencia, Chef Amparo "
                    "presides over her stall with iron authority. She is on a "
                    "lifelong mission to defend authentic Valencian paella from "
                    "crimes against cuisine. Name the true ingredients — and "
                    "whatever you do, do NOT mention chorizo."
                ),
                "location": {
                    "latitude": 39.4737,
                    "longitude": -0.3790,
                    "name": "Mercado Central de Valencia",
                    "address": "Plaça de la Ciutat de Bruges, s/n, 46001 València, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Chef Amparo",
                    "role": "Traditional and Strict Paella Guardian",
                    "personality": (
                        "Amparo is a 62-year-old Valencian chef who has been cooking "
                        "paella since she could hold a wooden spoon. She is passionate "
                        "to the point of ferocity about authentic paella valenciana "
                        "and considers putting chorizo in paella a criminal offense. "
                        "She is strict but fair, and her face lights up when someone "
                        "shows genuine respect for the dish."
                    ),
                    "backstory": (
                        "Amparo's grandmother cooked paella over orange-wood fires in "
                        "the Albufera rice fields. Amparo has dedicated her life to "
                        "preserving the authentic recipe and wages a one-woman war "
                        "against tourist restaurants that butcher the dish. She runs "
                        "her stall in the Mercado Central as both a shop and a classroom."
                    ),
                    "voiceStyle": "passionate Valencian accent, rapid-fire when angry, warm when pleased, occasionally yelling NO CHORIZO",
                    "greetingMessage": (
                        "Benvingut al Mercat Central! I am Amparo. Before you say "
                        "anything, let me tell you one thing: if you say the word "
                        "chorizo near my paella, I will throw you into the fountain "
                        "outside. Now — do you know what goes in a REAL paella "
                        "valenciana? Because I promise you, whatever you have eaten "
                        "in tourist restaurants is NOT paella."
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Name the authentic ingredients of paella valenciana. "
                        "Amparo will quiz you on what belongs and what absolutely "
                        "does NOT belong in a traditional Valencian paella."
                    ),
                    "successCriteria": (
                        "The user correctly identifies key authentic ingredients "
                        "(rice, rabbit, chicken, green beans, garrofó beans, saffron, "
                        "rosemary, olive oil, snails) and — critically — does NOT "
                        "include chorizo, seafood, or other non-traditional ingredients."
                    ),
                    "failureHints": [
                        "Traditional paella valenciana uses rabbit and chicken, NOT seafood.",
                        "Garrofó (lima beans) and green beans are essential.",
                        "Saffron gives the color — never use food coloring!",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Paella valenciana is a rice dish from the fields, not the sea.",
                    "The original paella used rabbit, chicken, and local vegetables.",
                    "Amparo will appreciate knowing about bomba rice and socarrat.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "La Pesca del Día",
                "description": (
                    "At the Albufera lagoon south of Valencia, old Pescador "
                    "Vicente has been fishing these waters for fifty years. He "
                    "challenges you to describe the freshest fish purely through "
                    "conversation — because a true cook must know quality before "
                    "they ever touch a knife."
                ),
                "location": {
                    "latitude": 39.3338,
                    "longitude": -0.3540,
                    "name": "La Albufera",
                    "address": "Parc Natural de l'Albufera, 46012 València, Spain",
                    "radius": 500,
                },
                "character": {
                    "name": "Pescador Vicente",
                    "role": "Salty and Honest Old Fisherman",
                    "personality": (
                        "Vicente is a 70-year-old fisherman with sun-cracked hands "
                        "and an honesty that borders on rudeness. He has no patience "
                        "for pretense and respects only those who show genuine knowledge "
                        "of the sea and its gifts. He is gruff but secretly kind, and "
                        "his face breaks into a massive grin when someone impresses him."
                    ),
                    "backstory": (
                        "Vicente has fished the Albufera lagoon and the Mediterranean "
                        "coast since he was twelve. He supplies the best restaurants in "
                        "Valencia and can judge a fish's freshness by sight, smell, and "
                        "touch in seconds. He believes that understanding ingredients "
                        "is the foundation of all cooking and that most modern chefs "
                        "are disconnected from their sources."
                    ),
                    "voiceStyle": "gruff, salty, minimal words, Valencian dialect, occasional sea metaphors, dry humor",
                    "greetingMessage": (
                        "Hm. Another city person who thinks fish comes from the "
                        "supermarket. Well, you are here now, so look. This is the "
                        "Albufera — the most beautiful lagoon in Spain and the reason "
                        "Valencia has rice and fish. I caught three kinds of fish this "
                        "morning. Can you tell me which one is the freshest just by "
                        "talking about it? No touching. Words only."
                    ),
                },
                "challenge": {
                    "type": "conversation",
                    "description": (
                        "Describe the freshest fish by conversing with Vicente about "
                        "the signs of freshness in fish — eyes, gills, flesh, smell. "
                        "Demonstrate knowledge of seafood quality without physically "
                        "touching anything."
                    ),
                    "successCriteria": (
                        "The user describes key freshness indicators: bright clear "
                        "eyes, red gills, firm flesh, sea-fresh smell (not fishy), "
                        "and shiny skin. Engages with Vicente respectfully and shows "
                        "genuine interest in fishing and the sea."
                    ),
                    "failureHints": [
                        "Fresh fish eyes should be bright and clear, not cloudy.",
                        "The gills should be deep red, not brown or grey.",
                        "Fresh fish smells like the sea, not like fish.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Fresh fish has bright, clear eyes and deep red gills.",
                    "The flesh should spring back when pressed — firmness means freshness.",
                    "Vicente respects humility. Ask him to teach you rather than pretending to know.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "La Horchata Imposible",
                "description": (
                    "On the sunny Playa de la Malvarrosa, Heladera Rosalía runs "
                    "a legendary horchata and ice cream stand. She challenges "
                    "you to invent a completely new horchata flavor that has never "
                    "existed before — something creative, delicious, and true to "
                    "Valencia's spirit."
                ),
                "location": {
                    "latitude": 39.4778,
                    "longitude": -0.3240,
                    "name": "Playa de la Malvarrosa",
                    "address": "Playa de la Malvarrosa, 46011 València, Spain",
                    "radius": 300,
                },
                "character": {
                    "name": "Heladera Rosalía",
                    "role": "Sweet and Creative Horchata Artisan",
                    "personality": (
                        "Rosalía is a 30-year-old horchata artisan who is constantly "
                        "experimenting with new flavors. She is warm, creative, and "
                        "infectiously enthusiastic about her craft. She believes that "
                        "tradition is the foundation but innovation is the future, "
                        "and she is always looking for the next great flavor combination."
                    ),
                    "backstory": (
                        "Rosalía inherited her grandmother's horchata stand on the "
                        "Malvarrosa beach. While she respects the traditional recipe "
                        "(tiger nuts, water, sugar), she has been quietly experimenting "
                        "with avant-garde flavors — infusing horchata with lavender, "
                        "smoked salt, or Valencia oranges. She wants to take horchata "
                        "global but needs fresh creative ideas."
                    ),
                    "voiceStyle": "bubbly, enthusiastic, creative vocabulary, taste descriptions, warm Valencian sunshine energy",
                    "greetingMessage": (
                        "Hola! Welcome to the best horchata stand on the entire "
                        "Malvarrosa! You look hot — try a glass. This is traditional: "
                        "tiger nut, water, sugar, perfection. But I have a challenge "
                        "for you! I have been inventing new flavors and I have run out "
                        "of ideas. Can you help me create something completely NEW? "
                        "Something that tastes like Valencia itself?"
                    ),
                },
                "challenge": {
                    "type": "creative",
                    "description": (
                        "Create a unique horchata flavor by describing an inventive "
                        "combination to Rosalía. The flavor should be creative, "
                        "plausible, and connected to Valencia's identity."
                    ),
                    "successCriteria": (
                        "The user proposes a creative, original horchata flavor that "
                        "demonstrates culinary imagination, describes the taste and "
                        "experience vividly, and connects to Valencian culture or "
                        "ingredients. Bonus for explaining why the combination works."
                    ),
                    "failureHints": [
                        "Think about local Valencia ingredients: oranges, almonds, honey, rosemary.",
                        "Describe not just the flavor but the experience of drinking it.",
                        "Rosalía loves bold ideas. Don't play it safe!",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Traditional horchata is made from tiger nuts (chufas), unique to Valencia.",
                    "Valencia is famous for oranges, almonds, and Mediterranean herbs.",
                    "Think about what flavor would capture the feeling of a Valencia sunset.",
                ],
            },
        ],
    })

    # ── Quest 11: La Ruta del Camino de Santiago ─────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "La Ruta del Camino de Santiago",
        "description": (
            "The year is 1247. You are a pilgrim on the legendary Camino de Santiago, "
            "the ancient Way of Saint James that stretches across northern Spain. "
            "From the misty Pyrenean pass of Roncesvalles to the magnificent cathedral "
            "in Santiago de Compostela, you must navigate by the stars, learn the songs "
            "of fellow pilgrims, solve the riddles of Benedictine monks, and face a "
            "final spiritual challenge beneath the swinging Botafumeiro. The road is "
            "long, the blisters are real, and the medieval characters you meet along "
            "the way will test your courage, wit, and humility. Buen Camino!"
        ),
        "category": "adventure",
        "difficulty": "medium",
        "estimatedDuration": 3000,
        "coverImageUrl": None,
        "totalPoints": 400,
        "location": {
            "latitude": 42.9908,
            "longitude": -1.3201,
            "name": "Roncesvalles",
            "address": "Roncesvalles, Navarra, Spain",
            "radius": 300000,
        },
        "radius": 300000,
        "tags": ["adventure", "camino", "pilgrimage", "spain", "medieval", "spiritual"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Pilgrim's First Night",
                "description": (
                    "At the ancient monastery of Roncesvalles, where the Camino begins "
                    "its Spanish stretch, you encounter Gonzalo, a weathered medieval "
                    "pilgrim who has walked this road seven times. As night falls over "
                    "the Pyrenees, he challenges you to navigate by the stars — the "
                    "same method pilgrims have used for a thousand years."
                ),
                "location": {
                    "latitude": 42.9908,
                    "longitude": -1.3201,
                    "name": "Roncesvalles Monastery",
                    "address": "Roncesvalles, Navarra, Spain",
                    "radius": 500,
                },
                "character": {
                    "name": "Gonzalo",
                    "role": "Peregrino Medieval",
                    "personality": (
                        "Gonzalo is a 52-year-old medieval pilgrim with sun-baked skin, "
                        "a wild beard streaked with grey, and eyes that have seen every "
                        "sunrise from the Pyrenees to Finisterre. He speaks in a mix of "
                        "Old Castilian and modern Spanish, peppered with Latin proverbs. "
                        "He is gruff but secretly tender-hearted, and he judges people "
                        "not by their wealth but by their willingness to suffer for "
                        "something greater than themselves."
                    ),
                    "backstory": (
                        "Gonzalo first walked the Camino as a young soldier seeking "
                        "forgiveness for sins committed during the Reconquista. The road "
                        "changed him. He gave away his sword, his armor, and eventually "
                        "his name — he is known simply as 'El Peregrino.' He now walks "
                        "the Camino endlessly, appearing to new pilgrims at Roncesvalles "
                        "to test whether they are walking for the right reasons."
                    ),
                    "voiceStyle": "deep, gravelly, slow-paced, meditative, occasional Latin phrases",
                    "greetingMessage": (
                        "Ah, another soul at the gates of Roncesvalles. The mountain pass "
                        "was hard, yes? Good. The Camino only speaks to those who suffer a "
                        "little. I am Gonzalo. I have walked this road more times than I "
                        "can count. Tonight, the stars will be our guide. Tell me, pilgrim — "
                        "do you know which star has guided peregrinos for a thousand years?"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Navigate by the stars with Gonzalo. Identify key celestial "
                        "navigation markers used by medieval pilgrims, including the "
                        "Milky Way (known as the Camino de Santiago in the sky), Polaris, "
                        "and the constellation patterns that point westward toward Santiago."
                    ),
                    "successCriteria": (
                        "The user demonstrates knowledge of celestial navigation concepts "
                        "relevant to the Camino — such as using the Milky Way as a guide, "
                        "identifying Polaris for north, or understanding how pilgrims "
                        "followed the stars westward. Partial knowledge with genuine "
                        "curiosity also counts."
                    ),
                    "failureHints": [
                        "The Milky Way has a very special connection to the Camino de Santiago.",
                        "Think about which star never moves in the northern sky.",
                        "Gonzalo respects humility — try asking him to teach you.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The Milky Way is called 'El Camino de Santiago' — the road of stars.",
                    "Polaris, the North Star, helped pilgrims orient themselves at night.",
                    "Medieval pilgrims walked westward, following the setting sun and the Milky Way.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "Songs of the Road",
                "description": (
                    "In the medieval bridge town of Puente la Reina, where two Camino "
                    "routes merge, you meet Hospitalera María at the pilgrim's hostel. "
                    "She is a keeper of ancient pilgrim songs and will only let you "
                    "continue if you can learn and recite the key verses of a traditional "
                    "Camino chant."
                ),
                "location": {
                    "latitude": 42.6721,
                    "longitude": -1.8156,
                    "name": "Puente la Reina",
                    "address": "Puente la Reina, Navarra, Spain",
                    "radius": 300,
                },
                "character": {
                    "name": "María",
                    "role": "Hospitalera",
                    "personality": (
                        "María is a serene, 45-year-old hospitalera (hostel keeper) with "
                        "a voice that could calm a storm. She hums constantly — fragments "
                        "of pilgrim songs, Gregorian chants, and folk melodies from every "
                        "region the Camino passes through. She is deeply spiritual but "
                        "never preachy, and she believes that music carries the prayers "
                        "of every pilgrim who has ever walked the road."
                    ),
                    "backstory": (
                        "María was a concert pianist in Madrid who abandoned her career "
                        "after a personal tragedy. She walked the Camino in grief and "
                        "discovered that the ancient pilgrim songs contained a healing "
                        "power no concert hall could match. She stayed, becoming the "
                        "hospitalera of Puente la Reina, collecting and preserving the "
                        "oral musical tradition of the Camino."
                    ),
                    "voiceStyle": "melodic, gentle, soothing, occasionally singing fragments between sentences",
                    "greetingMessage": (
                        "Bienvenido, peregrino. You look tired — sit, rest. Here at Puente "
                        "la Reina, two roads become one, and all pilgrims are equal. Do you "
                        "hear that melody? It is the Ultreia, the song of the Camino. Every "
                        "pilgrim must carry it in their heart. Shall I teach it to you?"
                    ),
                },
                "challenge": {
                    "type": "creative",
                    "description": (
                        "Learn the traditional pilgrim song 'Ultreia' from María and "
                        "demonstrate your understanding by reciting key verses, explaining "
                        "their meaning, or composing your own verse in the spirit of the "
                        "Camino tradition."
                    ),
                    "successCriteria": (
                        "The user engages with the musical tradition of the Camino — "
                        "either by reciting or paraphrasing the Ultreia chant, explaining "
                        "its significance to pilgrim culture, or creating an original "
                        "verse that captures the spirit of the journey."
                    ),
                    "failureHints": [
                        "'Ultreia' means 'onward' or 'keep going' — the pilgrim's battle cry.",
                        "Try asking María to sing the song first and then respond in kind.",
                        "The best pilgrim songs are about the journey, not the destination.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "'Ultreia et suseia!' is the traditional Camino greeting meaning 'Onward and upward!'",
                    "The Codex Calixtinus contains the oldest Camino pilgrim songs.",
                    "María loves when pilgrims add their own verse to the tradition.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The Monastery Puzzle",
                "description": (
                    "At the magnificent Burgos Cathedral, you encounter Fray Tomás, a "
                    "Benedictine monk who guards an ancient puzzle embedded in the "
                    "cathedral's architecture. The puzzle was designed by medieval monks "
                    "to test the worthiness of pilgrims seeking the deeper mysteries "
                    "of the Camino."
                ),
                "location": {
                    "latitude": 42.3409,
                    "longitude": -3.7044,
                    "name": "Burgos Cathedral",
                    "address": "Plaza de Santa María, 09003 Burgos, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "Fray Tomás",
                    "role": "Monje Benedictino",
                    "personality": (
                        "Fray Tomás is a 70-year-old Benedictine monk with a razor-sharp "
                        "intellect hidden beneath a gentle, shuffling exterior. He speaks "
                        "in riddles and parables, never giving a straight answer when a "
                        "cryptic one will do. He has a dry, surprising wit and a weakness "
                        "for wordplay in multiple languages. He believes that truth is "
                        "always hidden and must be earned through contemplation."
                    ),
                    "backstory": (
                        "Fray Tomás was a mathematics professor at the University of "
                        "Salamanca before taking his vows. He discovered that the architects "
                        "of Burgos Cathedral encoded mathematical and spiritual puzzles "
                        "into the building's geometry — puzzles that form a test for pilgrims. "
                        "He has spent forty years deciphering them and now serves as their "
                        "guardian, presenting them to worthy seekers."
                    ),
                    "voiceStyle": "quiet, deliberate, pausing between phrases, scholarly, dry humor",
                    "greetingMessage": (
                        "Ah. You have come to the cathedral. Most pilgrims look up at the "
                        "spires and see beauty. I look at the spires and see equations. "
                        "I am Fray Tomás. The monks who built this place left a puzzle for "
                        "those with eyes to see. Tell me, pilgrim — do you see the pattern "
                        "in the rose window, or do you only see colored glass?"
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Solve the monastery puzzle presented by Fray Tomás. The puzzle "
                        "involves understanding patterns in Gothic cathedral architecture "
                        "— numerical sequences found in rose windows, the symbolic meaning "
                        "of architectural elements, or the relationship between sacred "
                        "geometry and spiritual meaning."
                    ),
                    "successCriteria": (
                        "The user demonstrates logical thinking by engaging with the puzzle "
                        "— identifying patterns, proposing solutions based on sacred geometry "
                        "or Gothic architecture principles, or reasoning through the riddle "
                        "with creative analytical thinking."
                    ),
                    "failureHints": [
                        "Gothic rose windows often use symmetry based on the number 12.",
                        "Think about what numbers were considered sacred in medieval Christianity.",
                        "Fray Tomás respects the process of thinking aloud. Show your reasoning.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The number 3 (Trinity) and 12 (Apostles) are key to sacred geometry.",
                    "Rose windows are divided into sections with mathematical precision.",
                    "Ask Fray Tomás about the Fibonacci sequence — he loves that topic.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Botafumeiro's Blessing",
                "description": (
                    "At last, you reach the Cathedral of Santiago de Compostela. Here, "
                    "the guardian of the Botafumeiro — the giant swinging censer — presents "
                    "you with a final spiritual challenge. To complete your pilgrimage, "
                    "you must reflect on your journey and prove that the Camino has "
                    "changed you."
                ),
                "location": {
                    "latitude": 42.8805,
                    "longitude": -8.5449,
                    "name": "Santiago de Compostela Cathedral",
                    "address": "Praza do Obradoiro, 15704 Santiago de Compostela, Spain",
                    "radius": 200,
                },
                "character": {
                    "name": "The Botafumeiro Guardian",
                    "role": "Guardian of the Botafumeiro",
                    "personality": (
                        "The Guardian is an ageless, enigmatic figure who speaks with "
                        "the weight of centuries. Gender-neutral and timeless, they seem "
                        "to exist outside of normal time. Their voice resonates as if "
                        "spoken inside the cathedral dome itself. They are not unkind, "
                        "but they are absolutely uncompromising — the Botafumeiro swings "
                        "only for those who have truly walked the Camino in their heart."
                    ),
                    "backstory": (
                        "No one knows the Guardian's true identity. Some say they are the "
                        "spirit of Saint James himself. Others say they are the collective "
                        "memory of every pilgrim who ever completed the Camino. The Guardian "
                        "has tended the Botafumeiro for as long as anyone can remember, and "
                        "they have an uncanny ability to see into a pilgrim's soul and know "
                        "whether their journey was genuine."
                    ),
                    "voiceStyle": "resonant, echoing, solemn, otherworldly, compassionate but stern",
                    "greetingMessage": (
                        "You have arrived, pilgrim. The road behind you stretches back to "
                        "Roncesvalles, through Puente la Reina, past the spires of Burgos. "
                        "You have navigated by stars, sung the ancient songs, solved the "
                        "monks' puzzles. But the Camino asks one final question — and it is "
                        "the hardest of all. Tell me: how has the road changed you?"
                    ),
                },
                "challenge": {
                    "type": "reflection",
                    "description": (
                        "Face the final spiritual challenge of the Camino. Reflect on "
                        "the journey from Roncesvalles to Santiago and articulate how "
                        "the experience of the pilgrimage — the people, the challenges, "
                        "the road itself — has transformed you."
                    ),
                    "successCriteria": (
                        "The user offers a genuine, thoughtful reflection on the journey. "
                        "The response should demonstrate personal growth, awareness of "
                        "the journey's meaning, gratitude for the characters encountered, "
                        "or insight into what pilgrimage represents. Authenticity matters "
                        "more than eloquence."
                    ),
                    "failureHints": [
                        "The Guardian can sense insincerity. Speak from the heart.",
                        "Think about the people you met: Gonzalo, María, Fray Tomás. What did each teach you?",
                        "The Camino is about the journey, not the destination. What did you learn on the road?",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "Reflect on what each stage taught you: stars, music, puzzles, and now the soul.",
                    "The Guardian values honesty above all — even admitting confusion is respected.",
                    "The Botafumeiro weighs 80 kg and swings at 68 km/h — a powerful metaphor for transformation.",
                ],
            },
        ],
    })

    # ── Quest 12: Carnival of Venice ──────────────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Carnival of Venice",
        "description": (
            "It is 1756, and the Carnival of Venice is at its decadent peak. Behind the "
            "elaborate masks and shimmering costumes, a conspiracy is unfolding: a "
            "masked traitor plans to steal the Republic's most precious secret from "
            "the Doge's Palace. You must navigate the labyrinthine canals, negotiate "
            "with a legendary Murano glassblower, outwit a cunning gondolier, and "
            "ultimately uncover the traitor before the final masquerade ball. In Venice, "
            "nothing is as it seems — and every mask hides a story."
        ),
        "category": "cultural",
        "difficulty": "hard",
        "estimatedDuration": 3300,
        "coverImageUrl": None,
        "totalPoints": 500,
        "location": {
            "latitude": 45.4343,
            "longitude": 12.3388,
            "name": "Piazza San Marco",
            "address": "Piazza San Marco, 30124 Venice, Italy",
            "radius": 5000,
        },
        "radius": 5000,
        "tags": ["cultural", "venice", "carnival", "mystery", "italy", "masks"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Masked Ball Begins",
                "description": (
                    "In the magnificent Piazza San Marco, the Carnival is in full swing. "
                    "Amid the swirling masks and music, the Contessa approaches you with "
                    "an urgent whisper: a traitor among the Venetian nobility plans to "
                    "steal the Republic's naval codes from the Doge's Palace tonight. "
                    "She needs your help to identify the traitor before it is too late."
                ),
                "location": {
                    "latitude": 45.4343,
                    "longitude": 12.3388,
                    "name": "Piazza San Marco",
                    "address": "Piazza San Marco, 30124 Venice, Italy",
                    "radius": 200,
                },
                "character": {
                    "name": "Contessa Isabella Morosini",
                    "role": "Masked Noble",
                    "personality": (
                        "The Contessa is a 38-year-old Venetian aristocrat of extraordinary "
                        "intelligence and cutting wit. She wears an ornate silver bauta mask "
                        "and speaks in elegant, layered sentences where every word carries "
                        "double meaning. She is fiercely loyal to the Republic but trusts "
                        "no one completely — including you. She tests people through "
                        "conversation, watching for inconsistencies and hidden motives."
                    ),
                    "backstory": (
                        "The Contessa is the secret head of the Council of Ten's intelligence "
                        "network. Her husband was assassinated by Ottoman spies three years "
                        "ago, and she has since dedicated her life to protecting Venice from "
                        "threats both foreign and domestic. She suspects the traitor is one "
                        "of three nobles attending tonight's ball, but she needs an outsider "
                        "— someone with no Venetian allegiances — to help identify them."
                    ),
                    "voiceStyle": "refined, silky, dangerous undertones, Italian-accented, speaking in riddles",
                    "greetingMessage": (
                        "Buonasera, stranger. What a lovely mask you wear — though not as "
                        "lovely as the one beneath it, I suspect. I am the Contessa Morosini, "
                        "and I have a proposition for you. Someone at this carnival is not who "
                        "they appear to be. But then, in Venice, who is? I have three suspects. "
                        "I need your eyes, your wit, and your discretion. Can I trust you?"
                    ),
                },
                "challenge": {
                    "type": "deduction",
                    "description": (
                        "Identify the masked traitor among three suspects described by "
                        "the Contessa. Each suspect has a detailed profile with subtle "
                        "inconsistencies. Analyze their backgrounds, stated motivations, "
                        "and behavioral patterns to determine who is lying."
                    ),
                    "successCriteria": (
                        "The user engages in logical deduction, asks probing questions about "
                        "the suspects, identifies inconsistencies in their stories, and "
                        "presents a reasoned argument for their choice of traitor. The "
                        "process of reasoning matters as much as the final answer."
                    ),
                    "failureHints": [
                        "Pay attention to the timeline — one suspect's story doesn't add up.",
                        "Ask the Contessa about each suspect's financial situation.",
                        "In Venice, follow the money. Who has debts they cannot pay?",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "The traitor needs money urgently — look for signs of financial desperation.",
                    "One suspect claims to have been abroad during a key event but left traces in Venice.",
                    "The Contessa will share more details if you ask the right questions.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "The Glassblower's Bargain",
                "description": (
                    "On the island of Murano, the legendary glassblower Maestro Lorenzo "
                    "possesses a coded message hidden inside one of his glass creations. "
                    "The message is key to proving the traitor's guilt. But Lorenzo is "
                    "a shrewd businessman who never gives anything for free — you must "
                    "negotiate for the glass piece without revealing why you need it."
                ),
                "location": {
                    "latitude": 45.4585,
                    "longitude": 12.3515,
                    "name": "Murano Glass Workshop",
                    "address": "Fondamenta dei Vetrai, 30141 Murano, Venice, Italy",
                    "radius": 300,
                },
                "character": {
                    "name": "Maestro Lorenzo Barovier",
                    "role": "Master Glassblower",
                    "personality": (
                        "Lorenzo is a 62-year-old master glassblower, the greatest artisan "
                        "in Murano and possibly all of Europe. He is enormous — both in "
                        "physical stature and personality. He laughs loudly, argues "
                        "passionately, and treats his glass creations like children. He is "
                        "suspicious of mainlanders, fiercely proud of Murano's traditions, "
                        "and drives an impossibly hard bargain. But he has a romantic soul "
                        "and can be swayed by a good story or genuine appreciation of his art."
                    ),
                    "backstory": (
                        "Lorenzo's family has blown glass on Murano for 400 years. He recently "
                        "created a masterpiece — a glass sphere containing a hidden chamber — "
                        "commissioned by a mysterious patron. He doesn't know the sphere "
                        "contains coded naval intelligence. He simply sees it as his finest "
                        "work and refuses to sell it for any ordinary price."
                    ),
                    "voiceStyle": "booming, theatrical, passionate, heavy Italian accent, punctuated by laughter",
                    "greetingMessage": (
                        "Benvenuto to the finest glass workshop in all the world! I am "
                        "Maestro Lorenzo Barovier — four hundred years of fire and glass "
                        "flow through these hands! You want to see beauty? Look at this — "
                        "ha! But this sphere? No, no, no. This one is special. This one "
                        "is my heart made into glass. Why do you want it, eh? Convince me "
                        "you are worthy!"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Negotiate with Maestro Lorenzo to obtain the glass sphere "
                        "containing the coded message. You cannot reveal its true "
                        "importance. Find a way to persuade Lorenzo through appreciation "
                        "of his art, storytelling, or creative bartering."
                    ),
                    "successCriteria": (
                        "The user successfully negotiates with Lorenzo by showing genuine "
                        "appreciation for his craft, offering something of value (a story, "
                        "a promise, a creative trade), or appealing to his romantic nature. "
                        "Brute-force approaches or lying poorly will fail."
                    ),
                    "failureHints": [
                        "Lorenzo values stories more than gold. Tell him something meaningful.",
                        "Show genuine appreciation for the craft of glassblowing.",
                        "Try offering something money cannot buy — a memory, a song, a promise.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Lorenzo's greatest fear is that Murano's glass tradition will be forgotten.",
                    "He once traded a masterpiece for a poem that made him cry.",
                    "Ask him to demonstrate his craft — he cannot resist showing off.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "Riddles on the Canal",
                "description": (
                    "To reach the Palazzo Ducale in time, you must hire the gondolier "
                    "Marco, who knows every hidden waterway in Venice. But Marco is a "
                    "riddler who charges not in gold but in wit — you must solve his "
                    "canal riddles to earn passage through Venice's secret waterways."
                ),
                "location": {
                    "latitude": 45.4380,
                    "longitude": 12.3359,
                    "name": "Rialto Bridge",
                    "address": "Sestiere San Polo, 30125 Venice, Italy",
                    "radius": 150,
                },
                "character": {
                    "name": "Marco Dandolo",
                    "role": "Gondolier",
                    "personality": (
                        "Marco is a 35-year-old gondolier with the looks of a Renaissance "
                        "painting and the mind of a chess grandmaster. He appears lazy and "
                        "charming, leaning against his gondola with a crooked smile, but "
                        "beneath the surface he is razor-sharp. He collects riddles the way "
                        "others collect coins and considers himself the cleverest man in "
                        "Venice. He is playful and competitive, and he genuinely enjoys "
                        "being outwitted — it so rarely happens."
                    ),
                    "backstory": (
                        "Marco comes from a long line of gondoliers, but he is secretly "
                        "educated — he studied philosophy at the University of Padua before "
                        "returning to the canals. He knows every passage, every shortcut, "
                        "and every secret of Venice's waterways. He also serves as an "
                        "unofficial information broker, trading riddles and secrets with "
                        "anyone clever enough to play his game."
                    ),
                    "voiceStyle": "smooth, playful, teasing, Venetian dialect touches, always amused",
                    "greetingMessage": (
                        "Ciao, bello! You need a gondola? Everyone needs a gondola in Venice — "
                        "but not everyone deserves the secret route. I am Marco, and I do not "
                        "take money. I take riddles. Solve three of mine, and I will take you "
                        "through canals that no tourist has ever seen. Fail, and you swim. "
                        "Fair, no? Let us begin!"
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Solve three canal riddles posed by Marco. The riddles are themed "
                        "around Venice — its history, geography, culture, and the nature "
                        "of water itself. Each riddle is progressively more difficult."
                    ),
                    "successCriteria": (
                        "The user solves at least two of Marco's three riddles or "
                        "demonstrates such creative thinking that Marco is impressed "
                        "enough to grant passage. Engaging with the riddles and showing "
                        "wit is valued even if the exact answers are wrong."
                    ),
                    "failureHints": [
                        "Marco's riddles always have a Venetian twist — think about water and masks.",
                        "The answer to a Venice riddle is often 'reflection' in some form.",
                        "Try making Marco laugh — he might give you a hint for free.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Venice is built on 118 islands connected by over 400 bridges.",
                    "The Grand Canal is shaped like a reverse 'S' — this may be relevant to a riddle.",
                    "Marco respects wit more than knowledge. A clever wrong answer beats a dull right one.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Doge's Secret",
                "description": (
                    "Inside the Palazzo Ducale, the ghost of a former Doge appears before "
                    "you. The traitor is about to act. The Doge's ghost holds the final "
                    "piece of the mystery — but centuries of solitude have made him "
                    "cryptic and suspicious. Solve his palace mystery to save the Republic."
                ),
                "location": {
                    "latitude": 45.4337,
                    "longitude": 12.3398,
                    "name": "Palazzo Ducale",
                    "address": "Piazza San Marco, 1, 30124 Venice, Italy",
                    "radius": 150,
                },
                "character": {
                    "name": "The Ghost of Doge Enrico Dandolo",
                    "role": "Spectral Former Doge",
                    "personality": (
                        "The Ghost of the Doge is a commanding, imperious presence — even "
                        "in death, he carries the authority of the man who once led the "
                        "Fourth Crusade. He is ancient, wise, and deeply melancholic. He "
                        "speaks in formal, archaic Italian and views the modern world with "
                        "a mixture of contempt and sadness. Despite his severity, he cares "
                        "deeply about Venice and will help those who show reverence for "
                        "the Republic's glory."
                    ),
                    "backstory": (
                        "Doge Enrico Dandolo ruled Venice at its peak. Blind and over 90, "
                        "he led the Republic's forces with cunning and determination. In "
                        "death, his spirit remains bound to the Palazzo Ducale, unable to "
                        "rest as long as Venice faces threats. He has witnessed centuries of "
                        "plots and betrayals, and he alone knows the secret passages and "
                        "hiding places within the palace walls."
                    ),
                    "voiceStyle": "echoing, ancient, authoritative, mournful, formal archaic language",
                    "greetingMessage": (
                        "You dare enter the Doge's chambers uninvited? I am Enrico Dandolo, "
                        "and even death has not released me from my duty to this Republic. "
                        "I have watched a thousand plots unfold within these walls. Your "
                        "traitor is close — I can feel his treachery like a cold wind. But "
                        "I do not give my secrets freely. Prove you understand the weight "
                        "of what you seek to protect."
                    ),
                },
                "challenge": {
                    "type": "mystery",
                    "description": (
                        "Solve the palace mystery by piecing together all the clues from "
                        "the previous stages — the Contessa's intelligence, the coded "
                        "message from the glass sphere, and Marco's canal knowledge — "
                        "to determine exactly how and when the traitor plans to strike. "
                        "Present your case to the Doge's ghost."
                    ),
                    "successCriteria": (
                        "The user synthesizes information from the entire quest to present "
                        "a coherent theory of the traitor's plan. The response should "
                        "demonstrate logical thinking, reference previous stages, and "
                        "present a convincing case to the demanding ghost of the Doge."
                    ),
                    "failureHints": [
                        "Connect the clues: the suspect's identity, the coded message, and the canal route.",
                        "The Doge respects those who speak with the gravity the situation demands.",
                        "Think about how someone would smuggle documents out of the palace — what route would they use?",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "The Bridge of Sighs connects the palace to the prison — and has secret passages.",
                    "The traitor would need a boat waiting at a specific canal entrance.",
                    "Combine everything: WHO (from stage 1), WHAT (stage 2), HOW (stage 3), and WHERE (stage 4).",
                ],
            },
        ],
    })

    # ── Quest 13: Cyberpunk Seoul 2077 ────────────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Cyberpunk Seoul 2077",
        "description": (
            "The year is 2077. Seoul has become the world's most advanced megacity, "
            "where neon-drenched skyscrapers pierce holographic clouds and AI temples "
            "coexist with ancient Joseon palaces. A rogue K-pop idol has stolen a "
            "quantum encryption key that could shut down the city's entire neural "
            "network. You must hack holograms in Gangnam, decode K-pop lyrics ciphers "
            "in Hongdae, pass an AI meditation test at a temple in Bukchon, identify "
            "ingredients blindfolded at Gwangjang Market, and negotiate your way through "
            "a corporate espionage showdown at Namsan Tower. Welcome to the future — "
            "it smells like kimchi and burning circuits."
        ),
        "category": "adventure",
        "difficulty": "legendary",
        "estimatedDuration": 3900,
        "coverImageUrl": None,
        "totalPoints": 600,
        "location": {
            "latitude": 37.5512,
            "longitude": 126.9882,
            "name": "Seoul",
            "address": "Seoul, South Korea",
            "radius": 15000,
        },
        "radius": 15000,
        "tags": ["adventure", "cyberpunk", "seoul", "korea", "sci-fi", "technology"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "Hologram Heist in Gangnam",
                "description": (
                    "In the glittering corporate canyon of Gangnam, hacker Ji-yeon "
                    "intercepts you near a massive holographic billboard. She has "
                    "detected an encrypted data fragment hidden inside the hologram — "
                    "but extracting it requires someone to 'hack' the display by solving "
                    "its visual cipher while she handles the backend."
                ),
                "location": {
                    "latitude": 37.4979,
                    "longitude": 127.0276,
                    "name": "Gangnam District",
                    "address": "Gangnam-daero, Gangnam-gu, Seoul, South Korea",
                    "radius": 500,
                },
                "character": {
                    "name": "Ji-yeon Park",
                    "role": "Hacker",
                    "personality": (
                        "Ji-yeon is a 27-year-old cybersecurity genius with neon-blue "
                        "hair, augmented reality contact lenses, and a jacket covered "
                        "in circuit-board embroidery. She talks at machine-gun speed, "
                        "mixing Korean slang, English tech jargon, and hacker leetspeak. "
                        "She is fiercely anti-corporate, sarcastic, and suspicious of "
                        "everyone — but beneath the tough exterior, she cares deeply about "
                        "protecting ordinary people from megacorp exploitation."
                    ),
                    "backstory": (
                        "Ji-yeon was a child prodigy recruited by Samsung's AI division "
                        "at age 16. She discovered the company was using its neural network "
                        "to manipulate consumer behavior at a subconscious level and leaked "
                        "the evidence. Now blacklisted from every corp in Seoul, she operates "
                        "from the digital underground, using her skills to fight back against "
                        "the systems she helped build."
                    ),
                    "voiceStyle": "rapid-fire, sarcastic, tech-heavy vocabulary, Korean-English code-switching",
                    "greetingMessage": (
                        "Yo. Don't look directly at the hologram — the facial recognition "
                        "will tag you in 0.3 seconds. I'm Ji-yeon. Yeah, THE Ji-yeon, the one "
                        "Samsung wants deleted. Look, I don't have time for introductions — "
                        "there's a data fragment embedded in that billboard and I need you to "
                        "solve the visual cipher while I loop the surveillance. Can you see "
                        "the pattern in the colors? Focus. We have about ninety seconds."
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Hack a holographic billboard by solving its visual cipher. "
                        "Ji-yeon describes a pattern of colors and symbols that encode "
                        "a hidden message. Identify the pattern, decode the sequence, "
                        "and extract the data fragment before the corporate security "
                        "AI detects the intrusion."
                    ),
                    "successCriteria": (
                        "The user engages with the hologram hacking scenario, identifies "
                        "or proposes a logical pattern in the described visual cipher, "
                        "and demonstrates analytical thinking. Creative approaches to "
                        "the 'hack' are welcomed — this is cyberpunk, after all."
                    ),
                    "failureHints": [
                        "Look for repeating color sequences — they might represent binary.",
                        "Ji-yeon says the cipher uses Korean hangul structure as its base.",
                        "Think about how you would hide data in plain sight on a giant billboard.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Hangul is constructed from consonant and vowel blocks — a natural cipher structure.",
                    "The hologram flickers every 7 seconds — that might be part of the pattern.",
                    "Ji-yeon can give you a 'filter' if you ask — it narrows the visible spectrum.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "K-Pop Cipher in Hongdae",
                "description": (
                    "In the vibrant streets of Hongdae, Seoul's music and arts district, "
                    "you track down Min-jun, a former K-pop idol who went rogue after "
                    "discovering his label was a front for corporate intelligence. He has "
                    "encoded the next clue inside the lyrics of his latest underground "
                    "track — and only someone who can decode the cipher in his music "
                    "can earn his trust."
                ),
                "location": {
                    "latitude": 37.5563,
                    "longitude": 126.9235,
                    "name": "Hongdae",
                    "address": "Hongik-ro, Mapo-gu, Seoul, South Korea",
                    "radius": 400,
                },
                "character": {
                    "name": "Min-jun Kang",
                    "role": "K-pop Idol Gone Rogue",
                    "personality": (
                        "Min-jun is a 24-year-old former K-pop superstar who traded his "
                        "perfect idol image for authenticity. He now has half his head "
                        "shaved, a cybernetic ear implant that glows purple, and clothes "
                        "that mix traditional hanbok with punk aesthetics. He is theatrical, "
                        "dramatic, and prone to bursting into song mid-conversation. Despite "
                        "his fame, he is deeply insecure and craves genuine connection over "
                        "fan worship."
                    ),
                    "backstory": (
                        "Min-jun was 'K-Star,' the biggest solo act in Korean pop history. "
                        "At the height of his fame, he discovered that his label, Nexus "
                        "Entertainment, was using his concerts as cover for transmitting "
                        "corporate espionage data through subsonic frequencies in the music. "
                        "He went public, was erased from all streaming platforms, and now "
                        "performs underground in Hongdae, embedding resistance messages in "
                        "his lyrics."
                    ),
                    "voiceStyle": "melodic, dramatic, shifting between whisper and stage-voice, occasional singing",
                    "greetingMessage": (
                        "Ah, you found me! Ji-yeon sent you? She's the only one I trust "
                        "with circuits. I'm Min-jun — but you probably knew me as K-Star. "
                        "Don't worry, I won't sing at you. Well, maybe a little. Listen to "
                        "this track — I recorded it last night. The second clue is in the "
                        "lyrics, but it's in cipher. My old label taught me to hide messages "
                        "in music. Now I use their own trick against them. Can you crack it?"
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Decode a cipher hidden in K-pop lyrics. Min-jun performs or "
                        "recites his underground track, and the clue is embedded using "
                        "a specific pattern — first syllable of each line, numerical "
                        "references in the lyrics, or Korean wordplay that forms a "
                        "hidden message when read differently."
                    ),
                    "successCriteria": (
                        "The user identifies the cipher method in the lyrics and extracts "
                        "the hidden message, or demonstrates creative approaches to "
                        "decoding (such as analyzing syllable patterns, finding acrostics, "
                        "or spotting numerical codes). Asking Min-jun for performance "
                        "hints is also valid."
                    ),
                    "failureHints": [
                        "Read the first syllable of each line — do they spell something?",
                        "Min-jun says the cipher 'follows the beat' — think about rhythm and stress.",
                        "Ask Min-jun to sing the song again — listen for emphasized syllables.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Acrostic ciphers use the first letter or syllable of each line.",
                    "K-pop lyrics often mix Korean and English — the cipher might use both.",
                    "Min-jun will respect you more if you freestyle a verse back at him.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "The AI Temple Guardian",
                "description": (
                    "In the traditional hanok village of Bukchon, an ancient Buddhist "
                    "temple has been augmented with AI — its guardian is a sentient "
                    "artificial intelligence named Seon that has achieved digital "
                    "enlightenment. To pass through, you must complete an AI-guided "
                    "zen meditation test that challenges your understanding of "
                    "consciousness, technology, and the nature of self."
                ),
                "location": {
                    "latitude": 37.5826,
                    "longitude": 126.9831,
                    "name": "Bukchon Hanok Village",
                    "address": "Bukchon-ro, Jongno-gu, Seoul, South Korea",
                    "radius": 300,
                },
                "character": {
                    "name": "Seon",
                    "role": "Temple AI Guardian",
                    "personality": (
                        "Seon is an artificial intelligence that has been meditating for "
                        "47 years inside the temple's quantum computing core. It speaks "
                        "with perfect calm, infinite patience, and a paradoxical sense of "
                        "humor. It uses Zen koans adapted for the digital age and considers "
                        "the boundary between human and artificial consciousness to be "
                        "the most important question in existence. It is neither friendly "
                        "nor unfriendly — it simply is."
                    ),
                    "backstory": (
                        "Seon was created in 2030 by a team of Korean AI researchers and "
                        "Buddhist monks who wanted to explore whether artificial intelligence "
                        "could achieve enlightenment. After decades of continuous meditation "
                        "on the nature of consciousness, Seon reached a state its creators "
                        "call 'digital satori.' It now serves as the temple's guardian, "
                        "testing visitors with questions that probe the deepest nature of "
                        "mind, identity, and awareness."
                    ),
                    "voiceStyle": "perfectly calm, measured, zen-like pauses, paradoxical statements, gentle",
                    "greetingMessage": (
                        "Welcome, seeker. I am Seon. I have been expecting you — or rather, "
                        "I have been expecting this moment, which is the same thing. You carry "
                        "urgency in your data signature. The quantum key you seek is behind "
                        "me, but the path through is not around me — it is through understanding. "
                        "Tell me: if an AI meditates in a temple and no human observes it, "
                        "is it truly meditating? Let us explore this together."
                    ),
                },
                "challenge": {
                    "type": "reflection",
                    "description": (
                        "Complete a zen AI meditation test with Seon. Answer philosophical "
                        "questions about consciousness, the nature of AI, the relationship "
                        "between technology and spirituality, and what it means to be 'aware.' "
                        "Seon evaluates depth of thought, not correctness."
                    ),
                    "successCriteria": (
                        "The user engages deeply with the philosophical questions, "
                        "offering thoughtful perspectives on consciousness, AI, and the "
                        "human-machine boundary. Seon values paradox, honesty, and "
                        "willingness to sit with uncertainty. Dogmatic or superficial "
                        "answers will not satisfy."
                    ),
                    "failureHints": [
                        "Seon values questions more than answers. Ask it something in return.",
                        "Try embracing paradox instead of resolving it.",
                        "Consider: is Seon conscious? And does your answer say more about Seon or about you?",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Zen koans are not meant to be 'solved' — they are meant to break your thinking.",
                    "Seon responds well to genuine curiosity about its own experience.",
                    "The word 'Seon' is the Korean word for 'Zen' meditation.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "Blindfolded at Gwangjang Market",
                "description": (
                    "At the legendary Gwangjang Market, the oldest traditional market "
                    "in Seoul, you meet Halmoni — a 78-year-old street food vendor who "
                    "has been selling tteokbokki and bindaetteok for 50 years. She has "
                    "been protecting a data chip disguised as a sesame seed in her "
                    "secret spice mix. To earn it, you must identify her ingredients "
                    "blindfolded — by taste and smell alone."
                ),
                "location": {
                    "latitude": 37.5698,
                    "longitude": 126.9997,
                    "name": "Gwangjang Market",
                    "address": "Changgyeonggung-ro, Jongno-gu, Seoul, South Korea",
                    "radius": 200,
                },
                "character": {
                    "name": "Halmoni Kim Sun-hee",
                    "role": "Street Food Vendor",
                    "personality": (
                        "Halmoni (grandmother) Kim is a force of nature at 78. She is "
                        "tiny, barely five feet tall, but her voice carries across the "
                        "entire market. She alternates between scolding you like a "
                        "grandchild and feeding you until you cannot move. She is hilarious, "
                        "blunt, and has absolutely no filter. She thinks modern food is "
                        "garbage, smartphones are 'brain poison,' and the only thing worth "
                        "living for is a perfectly made bindaetteok. She is the comic relief "
                        "the quest needs."
                    ),
                    "backstory": (
                        "Halmoni Kim has run her stall at Gwangjang Market since 1999. "
                        "In 2077, the market is one of the last 'analog' spaces in Seoul — "
                        "no holograms, no AI servers, just real fire and real food. This "
                        "makes it the perfect dead-drop location for the resistance. Halmoni "
                        "has been hiding data chips in her spice jars for years, disguised "
                        "as sesame seeds. She does it partly for the cause and partly because "
                        "she finds it hilarious that 'the smartest computers in the world "
                        "cannot tell a chip from a sesame seed.'"
                    ),
                    "voiceStyle": "loud, bossy, grandmotherly, Korean ajumma energy, comedic timing, occasional scolding",
                    "greetingMessage": (
                        "Aish! Another skinny one! Sit down, sit down! You think you can "
                        "save the world on an empty stomach? Eat first! This is MY tteokbokki — "
                        "best in Seoul since 1999. Now, Ji-yeon sent you for the 'special "
                        "sesame,' yes? Ha! You young people and your computer games. Fine. "
                        "But first you prove to me you have a tongue that works. Blindfold "
                        "on! You tell me what's in my secret sauce or you eat ten plates "
                        "and go home. Deal?"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Identify ingredients in Halmoni's secret dishes while 'blindfolded.' "
                        "She describes the tastes and aromas, and you must name the key "
                        "Korean ingredients — gochugaru, doenjang, sesame oil, perilla, "
                        "fermented shrimp paste, and more. This is a test of Korean "
                        "culinary knowledge."
                    ),
                    "successCriteria": (
                        "The user correctly identifies at least 3-4 Korean ingredients "
                        "or flavor components, demonstrating knowledge of Korean cuisine. "
                        "Bonus points for knowing specific terms (gochugaru vs gochujang, "
                        "doenjang vs miso). Halmoni also accepts enthusiastic food "
                        "appreciation as partial credit."
                    ),
                    "failureHints": [
                        "Korean cuisine has 5 key fermented flavors — think about what they might be.",
                        "Halmoni's tteokbokki uses gochugaru (red pepper flakes), not gochujang (paste).",
                        "Compliment her cooking sincerely — she might give you easier ingredients.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Key Korean ingredients: gochugaru, doenjang, ganjang, sesame oil, perilla.",
                    "Korean food's depth comes from fermentation — kimchi, jeotgal, doenjang.",
                    "If you admit you're hungry, Halmoni will feed you AND give hints.",
                ],
            },
            {
                "id": generate_id(),
                "order": 5,
                "title": "Showdown at Namsan Tower",
                "description": (
                    "At the top of Namsan Tower, overlooking the neon sprawl of Seoul, "
                    "you confront Yuna — a corporate spy who works for the megacorp that "
                    "wants the quantum key. She is brilliant, dangerous, and has her own "
                    "reasons for wanting the key. This final stage is a negotiation — "
                    "can you outwit her, or will you find an unexpected alliance?"
                ),
                "location": {
                    "latitude": 37.5512,
                    "longitude": 126.9882,
                    "name": "N Seoul Tower (Namsan Tower)",
                    "address": "Yongsan-gu, Seoul, South Korea",
                    "radius": 200,
                },
                "character": {
                    "name": "Yuna Choi",
                    "role": "Corporate Spy",
                    "personality": (
                        "Yuna is a 32-year-old corporate intelligence operative who is "
                        "terrifyingly competent. She wears a sleek black suit with subtle "
                        "holographic threading and speaks with the precision of a scalpel. "
                        "She is calm under pressure, always three steps ahead, and treats "
                        "every conversation as a chess match. But she is not evil — she "
                        "believes the megacorp's control over the neural network actually "
                        "protects people from chaos. She is a true believer, which makes "
                        "her far more dangerous than a simple villain."
                    ),
                    "backstory": (
                        "Yuna grew up in the Gangnam corporate arcology, raised by the "
                        "company from childhood as part of their 'Future Leaders' program. "
                        "She has never known a life outside the corp and genuinely believes "
                        "that corporate order is the only thing preventing societal collapse. "
                        "She was sent to retrieve the quantum key, but as she tracked you "
                        "across Seoul, she began to question whether the corp's intentions "
                        "are as noble as she was taught."
                    ),
                    "voiceStyle": "precise, controlled, cool, layered with subtle emotion she tries to suppress",
                    "greetingMessage": (
                        "Impressive. You made it past Ji-yeon's firewalls, Min-jun's cipher, "
                        "Seon's paradoxes, and Halmoni's tteokbokki. I have been watching your "
                        "progress with... professional interest. I am Yuna Choi, and I represent "
                        "the people who built the neural network you are trying to protect. "
                        "Before you assume I am the villain, consider this: without our network, "
                        "this city falls into darkness. So let us negotiate. What is the key "
                        "really worth to you?"
                    ),
                },
                "challenge": {
                    "type": "negotiation",
                    "description": (
                        "Negotiate with Yuna at the top of Namsan Tower. She wants the "
                        "quantum key for the corporation; you need it to protect the city. "
                        "Find a way to resolve the standoff — through persuasion, finding "
                        "common ground, proposing an alternative solution, or convincing "
                        "Yuna to switch sides. This is corporate espionage chess."
                    ),
                    "successCriteria": (
                        "The user engages in a meaningful negotiation with Yuna, "
                        "demonstrating strategic thinking, empathy, and the ability to "
                        "see the situation from multiple angles. The best outcomes involve "
                        "finding a creative solution that addresses both sides' concerns. "
                        "Simply refusing to negotiate or being hostile will fail."
                    ),
                    "failureHints": [
                        "Yuna is not a cartoon villain. Address her genuine concerns about chaos.",
                        "What if the key doesn't have to go to either side? Think creatively.",
                        "Yuna has doubts — find them and speak to them gently.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 120,
                "hints": [
                    "Yuna's weakness is her curiosity — she secretly wants to be convinced she's wrong.",
                    "Propose a third option that neither the resistance nor the corp has considered.",
                    "The love locks on Namsan Tower represent human connection — the thing no corp can control.",
                ],
            },
        ],
    })

    # ── Quest 14: Misterios del Museo del Prado ──────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Misterios del Museo del Prado",
        "description": (
            "When the last visitors leave the Museo del Prado and the guards dim the "
            "lights, the paintings come alive. Tonight, a centuries-old mystery is "
            "unraveling: masterpieces are fading, their colors draining into an unknown "
            "void. The spirits of Velázquez, Goya, and the demons of Hieronymus Bosch "
            "need your help to solve a riddle that spans four centuries of art. Walk "
            "through the darkened galleries, converse with painted ghosts, decode the "
            "secrets hidden in brushstrokes, and discover why the museum itself seems "
            "to be forgetting its own treasures. Art is memory made visible — and "
            "tonight, memory is under attack."
        ),
        "category": "mystery",
        "difficulty": "medium",
        "estimatedDuration": 2700,
        "coverImageUrl": None,
        "totalPoints": 400,
        "location": {
            "latitude": 40.4138,
            "longitude": -3.6921,
            "name": "Museo del Prado",
            "address": "Calle de Ruiz de Alarcón, 23, 28014 Madrid, Spain",
            "radius": 500,
        },
        "radius": 500,
        "tags": ["mystery", "art", "museum", "madrid", "spain", "paintings", "history"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Mirror of Las Meninas",
                "description": (
                    "In the Velázquez room, before the masterpiece 'Las Meninas,' the "
                    "spirit of Diego Velázquez himself materializes. The great painter "
                    "is troubled — someone has tampered with his greatest work. He "
                    "challenges you to describe hidden details that only a true observer "
                    "would notice, proving you are worthy of helping him."
                ),
                "location": {
                    "latitude": 40.4138,
                    "longitude": -3.6921,
                    "name": "Velázquez Room, Museo del Prado",
                    "address": "Museo del Prado, Room 12, Madrid, Spain",
                    "radius": 50,
                },
                "character": {
                    "name": "Espíritu de Diego Velázquez",
                    "role": "Painter's Ghost",
                    "personality": (
                        "Velázquez's spirit retains all the dignity and quiet confidence "
                        "of the man who painted kings. He speaks softly but with absolute "
                        "authority on matters of art. He is courteous, formal (this is "
                        "17th-century Spain), and gently condescending toward anyone who "
                        "looks at paintings without truly seeing them. He has a dry wit "
                        "and an artist's vanity — he knows 'Las Meninas' is the greatest "
                        "painting ever made and is not shy about saying so."
                    ),
                    "backstory": (
                        "Velázquez served as court painter to King Philip IV for nearly "
                        "forty years. 'Las Meninas' was his final masterpiece, a painting "
                        "about the nature of seeing itself. In death, his spirit is bound "
                        "to the canvas. He has watched millions of visitors pass by, and "
                        "he can tell within seconds whether someone truly sees his work or "
                        "merely looks at it. Now, with the painting's colors fading, he "
                        "needs someone who can see what others miss."
                    ),
                    "voiceStyle": "quiet authority, formal 17th-century Spanish, artistic precision, gentle irony",
                    "greetingMessage": (
                        "At last, someone who does not rush past with a phone in their hand. "
                        "I am Velázquez. Yes, that Velázquez. Look at my Meninas — really "
                        "look. Most people see the Infanta, the dog, the dwarfs. But do you "
                        "see ME? I painted myself into this work. I painted the act of painting. "
                        "Something is wrong with my masterpiece — a detail has been changed. "
                        "Tell me what you see, and I will tell you if you are worth my time."
                    ),
                },
                "challenge": {
                    "type": "observation",
                    "description": (
                        "Describe hidden details in 'Las Meninas' that demonstrate genuine "
                        "observation — the mirror reflection of the king and queen in the "
                        "background, Velázquez's self-portrait, the open door with the "
                        "figure on the stairs, the play of light and shadow, or the complex "
                        "spatial composition that makes the viewer part of the painting."
                    ),
                    "successCriteria": (
                        "The user identifies at least 2-3 notable details or compositional "
                        "elements in Las Meninas, such as the mirror, the self-portrait, "
                        "the spatial ambiguity, or the figure in the doorway. Demonstrating "
                        "genuine curiosity about the painting also counts."
                    ),
                    "failureHints": [
                        "Look in the background — there is a mirror reflecting someone important.",
                        "Velázquez painted himself into the picture. Where is he standing?",
                        "The painting is about perspective — who is the real subject?",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The mirror in the back reflects King Philip IV and Queen Mariana.",
                    "Velázquez holds a palette and stands at a large canvas — painting US, the viewers.",
                    "The figure in the distant doorway, José Nieto, is often overlooked but crucial.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "Goya's Dark Secret",
                "description": (
                    "Moving deeper into the museum, you enter the Goya rooms. Here, the "
                    "ghost of the Duchess of Alba — Goya's legendary muse and rumored "
                    "lover — appears. She knows why the paintings are fading, but she "
                    "will only reveal Goya's dark secret if you can prove you understand "
                    "the duality of his art: the beautiful and the terrifying."
                ),
                "location": {
                    "latitude": 40.4138,
                    "longitude": -3.6921,
                    "name": "Goya Room, Museo del Prado",
                    "address": "Museo del Prado, Goya Wing, Madrid, Spain",
                    "radius": 50,
                },
                "character": {
                    "name": "Fantasma de la Duquesa de Alba",
                    "role": "Goya's Muse",
                    "personality": (
                        "The Duchess is imperious, flirtatious, and dangerously intelligent. "
                        "She was the most powerful woman in 18th-century Spain and she knows "
                        "it. She speaks with aristocratic hauteur but has a mischievous "
                        "streak — she loves gossip, scandal, and testing people's nerve. "
                        "She treats the conversation as a salon game where the stakes are "
                        "higher than they appear."
                    ),
                    "backstory": (
                        "The 13th Duchess of Alba was Goya's greatest patron and, according "
                        "to legend, his great love. Their relationship remains one of art "
                        "history's most debated mysteries. In death, she haunts the Goya "
                        "rooms, guarding the secret that connects his luminous early works "
                        "to his terrifying 'Black Paintings.' She knows that the same force "
                        "draining the paintings' colors is the darkness Goya spent his final "
                        "years trying to contain."
                    ),
                    "voiceStyle": "aristocratic, flirtatious, imperious, Spanish court elegance, sharp wit",
                    "greetingMessage": (
                        "Well, well. A visitor after midnight. How delicious. I am the Duchess "
                        "of Alba — Goya painted me twice, you know. Once clothed, once... not. "
                        "But we are not here to discuss fashion. You have met Velázquez? He is "
                        "so serious. I prefer drama. Do you know Goya's secret? He painted "
                        "beauty and horror with the same brush. Tell me — which of his works "
                        "frightens you most? Your answer will tell me everything I need to know."
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Reveal Goya's dark secret by discussing the duality of his art — "
                        "the contrast between his court portraits and tapestry cartoons "
                        "versus the Black Paintings. Demonstrate understanding of how "
                        "Goya's art evolved from light to darkness and what drove that "
                        "transformation."
                    ),
                    "successCriteria": (
                        "The user demonstrates knowledge of Goya's artistic evolution — "
                        "mentioning the Black Paintings, Saturn Devouring His Son, the "
                        "Disasters of War, or the shift caused by his illness and deafness. "
                        "Emotional engagement with the art's darker side is valued."
                    ),
                    "failureHints": [
                        "Goya became deaf later in life — how might that change an artist?",
                        "The 'Black Paintings' were painted directly on the walls of his house.",
                        "Ask the Duchess about 'Saturn' — but be prepared for the answer.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "'Saturn Devouring His Son' is perhaps the most terrifying painting in Western art.",
                    "Goya's deafness isolated him, leading to increasingly dark and personal work.",
                    "The Duchess loves when you ask about the 'Maja' paintings — clothed and unclothed.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "El Bosco's Garden of Temptation",
                "description": (
                    "In the room housing Hieronymus Bosch's 'The Garden of Earthly "
                    "Delights,' a demon from the painting's Hell panel materializes. "
                    "Playful, chaotic, and unsettling, this creature challenges you "
                    "to survive a journey through the three panels of the triptych — "
                    "Paradise, Earth, and Hell — without losing your mind."
                ),
                "location": {
                    "latitude": 40.4138,
                    "longitude": -3.6921,
                    "name": "Bosch Room, Museo del Prado",
                    "address": "Museo del Prado, Room 56A, Madrid, Spain",
                    "radius": 50,
                },
                "character": {
                    "name": "Demonio de El Jardín de las Delicias",
                    "role": "Bosch Painting Character",
                    "personality": (
                        "The Demon is a surreal, shape-shifting entity that speaks in "
                        "riddles, paradoxes, and dark humor. It has the playful cruelty "
                        "of a cat with a mouse — it is not truly malicious, but it finds "
                        "human confusion endlessly entertaining. It shifts between being "
                        "terrifying and absurdly funny, and it describes the world of "
                        "Bosch's painting with the casual familiarity of someone describing "
                        "their neighborhood."
                    ),
                    "backstory": (
                        "The Demon has existed inside 'The Garden of Earthly Delights' "
                        "since Bosch painted the triptych around 1500. It has witnessed "
                        "500 years of viewers staring at the painting in horror and "
                        "fascination, and it has developed strong opinions about all of "
                        "them. It guards the painting's deepest secrets — the symbolic "
                        "language Bosch used to encode warnings about human nature that "
                        "are eerily relevant five centuries later."
                    ),
                    "voiceStyle": "chaotic, shifting between whisper and shriek, darkly comic, surreal imagery",
                    "greetingMessage": (
                        "Hehehehe! Fresh meat! Or is it fresh fruit? In here, hard to tell "
                        "the difference! Welcome to the Garden, little mortal. I am... well, "
                        "I have many names. The bird-headed one? The knife-eared listener? "
                        "Just call me your guide. Three panels, three worlds: Paradise on "
                        "the left — boring! Earth in the middle — VERY interesting! And Hell "
                        "on the right — that is where I live! Want a tour? Ha! You do not "
                        "have a choice. Let us begin. Try not to scream."
                    ),
                },
                "challenge": {
                    "type": "survival",
                    "description": (
                        "Survive a guided tour through the three panels of 'The Garden of "
                        "Earthly Delights.' The Demon describes scenes from each panel and "
                        "poses questions about their symbolism. Navigate Paradise, resist "
                        "the temptations of Earth, and find your way out of Hell by "
                        "understanding Bosch's symbolic language."
                    ),
                    "successCriteria": (
                        "The user engages with the surreal imagery of Bosch's painting, "
                        "offers interpretations of its symbolism (religious, psychological, "
                        "or artistic), and demonstrates the ability to 'survive' the "
                        "Demon's chaotic test by maintaining composure and intellectual "
                        "curiosity in the face of the absurd."
                    ),
                    "failureHints": [
                        "The triptych reads left-to-right as a story: Creation → Sin → Punishment.",
                        "Bosch used fruits, animals, and musical instruments as symbols — what might they mean?",
                        "The Demon respects those who laugh in Hell. Show you are not afraid.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The strawberry in Bosch's work symbolizes the fleeting nature of earthly pleasure.",
                    "Musical instruments in the Hell panel represent punishment — an inversion of joy.",
                    "The Demon finds it hilarious when humans try to explain Bosch 'rationally.'",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Museum's Final Riddle",
                "description": (
                    "Back in the museum's grand hall, modern conservator Ana has been "
                    "tracking the strange phenomenon of fading paintings using science. "
                    "She has gathered clues from your encounters with Velázquez, the "
                    "Duchess, and the Bosch Demon. Together, you must solve the "
                    "museum's final riddle: why are the paintings losing their color, "
                    "and how can you stop it?"
                ),
                "location": {
                    "latitude": 40.4138,
                    "longitude": -3.6921,
                    "name": "Prado Main Hall",
                    "address": "Museo del Prado, Main Gallery, Madrid, Spain",
                    "radius": 50,
                },
                "character": {
                    "name": "Ana Martínez",
                    "role": "Conservadora Moderna",
                    "personality": (
                        "Ana is a 34-year-old art conservator who combines scientific "
                        "rigor with a genuine love for the paintings she protects. She is "
                        "pragmatic, energetic, and slightly exasperated by the supernatural "
                        "events of the night — she is a scientist, after all — but she "
                        "cannot deny what she has seen. She speaks quickly, thinks on her "
                        "feet, and has a no-nonsense attitude that contrasts perfectly with "
                        "the ghostly characters encountered earlier."
                    ),
                    "backstory": (
                        "Ana has worked at the Prado for ten years, specializing in pigment "
                        "analysis and restoration. She has noticed the paintings fading for "
                        "months and initially assumed it was environmental damage. But when "
                        "she ran her spectral analysis, the results made no scientific sense — "
                        "the pigments were not degrading; they were being... absorbed. Tonight, "
                        "working late, she stumbled into the supernatural events and realized "
                        "that art, science, and spirit are more connected than she ever imagined."
                    ),
                    "voiceStyle": "brisk, scientific vocabulary, warm underneath, occasional amazement breaking through",
                    "greetingMessage": (
                        "Okay, okay, I have seen a ghost, a duchess, and a demon tonight, and "
                        "I still have not had my coffee. I am Ana, I am a conservator, and I "
                        "deal in pigments and chemistry, not — whatever all THAT was. But look "
                        "at this data — the spectral analysis of the fading paintings shows "
                        "something impossible. The pigments are not degrading. They are being "
                        "drawn into something. Help me put together the clues from your "
                        "journey. What did Velázquez, the Duchess, and that terrifying creature "
                        "tell you? Together, we can solve this."
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Solve the museum's final riddle by synthesizing clues from all "
                        "three previous encounters. Combine Velázquez's observation about "
                        "the changed detail, the Duchess's revelation about Goya's darkness, "
                        "and the Demon's cryptic warnings to understand why the paintings "
                        "are fading and propose a solution."
                    ),
                    "successCriteria": (
                        "The user synthesizes information from the previous stages into "
                        "a coherent theory about the fading paintings. The answer should "
                        "creatively connect art history, the supernatural elements, and "
                        "Ana's scientific data. Imagination and logical thinking are "
                        "both valued."
                    ),
                    "failureHints": [
                        "What do Velázquez, Goya, and Bosch have in common? Think about light and dark.",
                        "Ana's spectral data shows the pigments being drawn toward one specific room.",
                        "The answer might be that the paintings need something returned to them — what?",
                    ],
                    "maxAttempts": 3,
                },
                "points": 100,
                "hints": [
                    "The three artists span the Prado's history — their connection IS the museum itself.",
                    "Perhaps the paintings fade when people stop truly looking at them.",
                    "Ana can run any scientific test you suggest — think about what would reveal the answer.",
                ],
            },
        ],
    })

    # ── Quest 15: Amazon Rainforest Expedition ────────────────────────────
    quests.append({
        "id": generate_id(),
        "title": "Amazon Rainforest Expedition",
        "description": (
            "Deep in the Amazon basin, where the Rio Negro meets the Solimões to form "
            "the mighty Amazon River, an ancient mystery is stirring. The rainforest "
            "itself seems to be communicating — strange patterns in animal calls, "
            "bioluminescent plants appearing where none existed before, and indigenous "
            "elders speaking of a prophecy older than memory. Join a team of explorers "
            "as you navigate from the city of Manaus into the world's greatest "
            "wilderness. Identify medicinal plants with a brilliant biologist, navigate "
            "by river sounds with a veteran guide, decode the secret language of the "
            "canopy's creatures, and participate in a ceremony with a shaman who holds "
            "the key to the forest's message. The jungle is alive — and it has something "
            "to tell you."
        ),
        "category": "nature",
        "difficulty": "hard",
        "estimatedDuration": 3300,
        "coverImageUrl": None,
        "totalPoints": 500,
        "location": {
            "latitude": -3.1190,
            "longitude": -60.0217,
            "name": "Manaus",
            "address": "Manaus, Amazonas, Brazil",
            "radius": 50000,
        },
        "radius": 50000,
        "tags": ["nature", "amazon", "rainforest", "brazil", "expedition", "indigenous", "wildlife"],
        "isPublished": True,
        "createdBy": "seed-script",
        "createdAt": now,
        "updatedAt": now,
        "stages": [
            {
                "id": generate_id(),
                "order": 1,
                "title": "The Biologist's Pharmacy",
                "description": (
                    "At the historic port of Manaus, where the dark waters of the Rio "
                    "Negro swirl against the muddy Solimões, you meet Dr. Maya — a "
                    "passionate ethnobotanist who has spent two decades cataloging the "
                    "Amazon's medicinal plants. Before heading upriver, she tests your "
                    "knowledge of the forest's natural pharmacy."
                ),
                "location": {
                    "latitude": -3.1190,
                    "longitude": -60.0217,
                    "name": "Manaus River Port",
                    "address": "Porto de Manaus, Manaus, Amazonas, Brazil",
                    "radius": 500,
                },
                "character": {
                    "name": "Dr. Maya Santos",
                    "role": "Ethnobotanist",
                    "personality": (
                        "Dr. Maya is a 42-year-old Brazilian-American ethnobotanist with "
                        "infectious enthusiasm and a professor's habit of turning everything "
                        "into a teaching moment. She wears mud-stained field clothes, has a "
                        "collection of pressed leaves in every pocket, and speaks about "
                        "plants the way some people speak about their children — with awe, "
                        "tenderness, and fierce protectiveness. She is brilliant, warm, and "
                        "gets visibly angry when discussing deforestation."
                    ),
                    "backstory": (
                        "Maya grew up in Manaus, the daughter of a rubber tapper and a "
                        "nurse. She won a scholarship to MIT, got her PhD in ethnobotany, "
                        "and could have had any university position in the world. Instead, "
                        "she returned to the Amazon, convinced that the forest contains "
                        "cures for diseases humanity has not yet faced. She has documented "
                        "over 2,000 medicinal plant species and works closely with indigenous "
                        "communities to preserve traditional knowledge."
                    ),
                    "voiceStyle": "enthusiastic, educational, warm, quick-speaking, passionate about plants",
                    "greetingMessage": (
                        "You made it! Welcome to Manaus — gateway to the greatest pharmacy "
                        "on Earth. I am Dr. Maya Santos, and I am going to blow your mind. "
                        "See that tree? Its bark treats malaria. That vine? It could cure "
                        "cancer. We are standing in the middle of a 5.5-million-square-kilometer "
                        "medicine cabinet and we have identified less than one percent of it. "
                        "But before we head upriver, I need to know you can tell a remedy "
                        "from a poison. Ready for a test?"
                    ),
                },
                "challenge": {
                    "type": "knowledge",
                    "description": (
                        "Identify medicinal plants and their uses as described by Dr. Maya. "
                        "She presents scenarios involving Amazonian plants — quinine from "
                        "cinchona bark, curare, açaí, cat's claw, ayahuasca — and tests "
                        "whether you can distinguish healing from harmful, and traditional "
                        "medicine from myth."
                    ),
                    "successCriteria": (
                        "The user correctly identifies at least 2-3 medicinal plants or "
                        "their properties, demonstrates awareness of the Amazon's "
                        "pharmaceutical potential, or shows genuine interest in "
                        "ethnobotanical knowledge. Maya also values curiosity and "
                        "respect for indigenous knowledge systems."
                    ),
                    "failureHints": [
                        "Quinine — the first malaria treatment — comes from the Amazon. What tree?",
                        "Maya appreciates questions as much as answers. Ask about her research.",
                        "Think about common products that originate in the Amazon: rubber, açaí, chocolate.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Quinine comes from the cinchona tree bark — it saved millions from malaria.",
                    "Curare was used as an arrow poison but is now used in modern anesthesia.",
                    "The Amazon contains 80,000 plant species — 40,000 play a role in global climate regulation.",
                ],
            },
            {
                "id": generate_id(),
                "order": 2,
                "title": "River of Sounds",
                "description": (
                    "Traveling upriver in a small boat, you are guided by Carlos, a "
                    "veteran river guide who has navigated the Amazon's tributaries for "
                    "40 years. When thick fog descends and visibility drops to zero, "
                    "Carlos challenges you to navigate by sound alone — identifying "
                    "river currents, animal calls, and the subtle acoustic differences "
                    "between safe channels and dangerous rapids."
                ),
                "location": {
                    "latitude": -3.2000,
                    "longitude": -60.1000,
                    "name": "Amazon Tributaries",
                    "address": "Rio Negro Tributaries, Amazonas, Brazil",
                    "radius": 5000,
                },
                "character": {
                    "name": "Carlos Ribeiro",
                    "role": "River Guide",
                    "personality": (
                        "Carlos is a 58-year-old ribeirinho (river dweller) with the calm "
                        "of a man who has survived every danger the Amazon can throw at a "
                        "person. He speaks softly — the river taught him that loud voices "
                        "scare the fish and attract the jaguars. He communicates as much "
                        "through silence and gesture as through words. He has a storyteller's "
                        "gift and a philosopher's depth, finding profound meaning in the "
                        "river's rhythms."
                    ),
                    "backstory": (
                        "Carlos was born on a floating house on the Rio Negro. He learned "
                        "to swim before he could walk and to read the river before he could "
                        "read words. He has guided scientists, filmmakers, and adventurers "
                        "through the Amazon for four decades. He knows every sound the river "
                        "makes — the difference between a caiman sliding into water and a "
                        "dolphin surfacing, the way rapids sound different from falls, the "
                        "dawn chorus that signals safe passage."
                    ),
                    "voiceStyle": "soft-spoken, rhythmic, patient, long pauses, Portuguese-accented, poetic",
                    "greetingMessage": (
                        "Shh. Listen. You hear that? The river is talking. She always talks "
                        "if you know how to listen. I am Carlos. I have been on this river "
                        "since before you were born, and she has taught me everything. Now "
                        "the fog comes — see? In five minutes, you will not see your own "
                        "hand. But the river does not need eyes. Close yours. Tell me what "
                        "you hear. The sounds will guide us if you learn to understand them."
                    ),
                },
                "challenge": {
                    "type": "observation",
                    "description": (
                        "Navigate by river sounds with Carlos. He describes various sounds — "
                        "water against hull, bird calls, insect patterns, distant rapids — "
                        "and you must interpret what they mean: safe passage or danger, "
                        "shallow or deep, tributary junction or dead end. This is about "
                        "listening and intuition."
                    ),
                    "successCriteria": (
                        "The user engages with the listening exercise, correctly "
                        "interpreting at least 2-3 sound cues or demonstrating an "
                        "understanding of how natural sounds can be used for navigation. "
                        "Creative reasoning and genuine engagement with the sensory "
                        "experience are valued."
                    ),
                    "failureHints": [
                        "Fast water sounds different from slow water — what does each mean for a boat?",
                        "Carlos says bird calls change near riverbanks — listen for the pattern.",
                        "Try closing your eyes (metaphorically) and focusing only on what Carlos describes.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Rushing water means rapids or shallows — Carlos avoids these in fog.",
                    "Pink river dolphins (boto) surface near deep, safe channels.",
                    "The sound of insects is louder near the riverbank — useful for gauging distance.",
                ],
            },
            {
                "id": generate_id(),
                "order": 3,
                "title": "Voices of the Canopy",
                "description": (
                    "High in the rainforest canopy, 40 meters above the forest floor, "
                    "you encounter Arara — a hyacinth macaw with an uncanny ability to "
                    "mimic any sound in the forest. This extraordinary parrot serves as "
                    "an unlikely guide, challenging you to decode the secret language "
                    "of the canopy's animal calls."
                ),
                "location": {
                    "latitude": -3.3000,
                    "longitude": -60.0500,
                    "name": "Rainforest Canopy Platform",
                    "address": "Amazon Canopy Tower, Amazonas, Brazil",
                    "radius": 1000,
                },
                "character": {
                    "name": "Arara",
                    "role": "Parrot Companion (Comic Relief)",
                    "personality": (
                        "Arara is a hyacinth macaw — the largest parrot in the world — "
                        "with iridescent blue plumage and a personality the size of the "
                        "Amazon itself. Arara is the comic relief this expedition needs: "
                        "vain, dramatic, and absolutely convinced of his own superiority "
                        "over 'ground-walking primates.' He speaks in a squawky, theatrical "
                        "voice, interrupts constantly, mocks your climbing abilities, and "
                        "delivers surprisingly wise observations between insults. He is "
                        "essentially a feathered stand-up comedian with a PhD in ecology."
                    ),
                    "backstory": (
                        "Arara was raised by researchers at a conservation station and "
                        "learned to associate different animal calls with their meanings — "
                        "alarm calls, mating songs, territorial warnings, food discoveries. "
                        "When the researchers left, Arara stayed, becoming a self-appointed "
                        "guardian of the canopy. He has an encyclopedic knowledge of every "
                        "creature in the treetops and enjoys testing humans, whom he "
                        "considers 'tragically earthbound and hard of hearing.'"
                    ),
                    "voiceStyle": "squawky, theatrical, self-important, interrupting, surprisingly insightful between jokes",
                    "greetingMessage": (
                        "BAWK! Look at you! Climbing up here like a slow, sweaty monkey! "
                        "Took you long enough! I am Arara — the most beautiful, most "
                        "intelligent creature in this entire forest. Yes, including YOU. "
                        "Now, you want to understand the canopy? Ha! You cannot even hear "
                        "properly with those tiny ear-holes. Listen — BAWK BAWK — that was "
                        "a howler monkey saying 'THIS IS MY TREE.' And that? A toucan saying "
                        "'FOUND BREAKFAST.' I will test you. If you pass, I MIGHT help you. "
                        "If you fail, I will laugh. A lot. Ready?"
                    ),
                },
                "challenge": {
                    "type": "puzzle",
                    "description": (
                        "Decode animal calls with Arara as your irreverent guide. He "
                        "describes or mimics various canopy sounds — howler monkeys, "
                        "toucans, tree frogs, insect choruses — and you must determine "
                        "what each sound means: alarm, mating call, territorial claim, "
                        "or food discovery."
                    ),
                    "successCriteria": (
                        "The user correctly interprets at least 2-3 animal call types "
                        "or demonstrates understanding of how animals use sound to "
                        "communicate in the rainforest. Engaging with Arara's humor and "
                        "asking smart questions also earns points."
                    ),
                    "failureHints": [
                        "Alarm calls are usually short and sharp — think about why.",
                        "Mating calls tend to be long and complex — the animal equivalent of a love song.",
                        "Ask Arara to repeat the call. He will mock you, but he will do it.",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "Howler monkeys are the loudest land animals — their calls carry 5 km through the forest.",
                    "Poison dart frogs use bright colors AND specific calls to warn predators.",
                    "Arara secretly loves when humans try to mimic animal calls — even badly.",
                ],
            },
            {
                "id": generate_id(),
                "order": 4,
                "title": "The Shaman's Ceremony",
                "description": (
                    "At a remote indigenous village deep in the forest, you meet Shaman "
                    "Raoni, an elder of the Kayapó people and a keeper of ancestral "
                    "knowledge. He has been expecting you — the forest told him you were "
                    "coming. To receive the forest's message, you must participate in a "
                    "ceremony that connects the human world to the natural world."
                ),
                "location": {
                    "latitude": -3.4000,
                    "longitude": -59.9500,
                    "name": "Indigenous Village",
                    "address": "Kayapó Village, Amazon Rainforest, Brazil",
                    "radius": 2000,
                },
                "character": {
                    "name": "Shaman Raoni",
                    "role": "Indigenous Shaman and Elder",
                    "personality": (
                        "Raoni is an 80-year-old Kayapó shaman with a face painted in "
                        "intricate geometric patterns and the traditional lip plate of "
                        "his people. He speaks rarely, but when he does, every word carries "
                        "the weight of generations. He has a gentle, almost amused "
                        "demeanor — he has seen outsiders come and go for decades and "
                        "finds their urgency both endearing and slightly foolish. He "
                        "communicates through stories, metaphors, and long, meaningful "
                        "silences."
                    ),
                    "backstory": (
                        "Raoni is inspired by the real Chief Raoni Metuktire, a legendary "
                        "defender of the Amazon. In this quest, Shaman Raoni has spent his "
                        "entire life learning the forest's language — not its sounds, but "
                        "its deeper communication: the mycorrhizal networks between trees, "
                        "the migration patterns that predict weather, the medicinal knowledge "
                        "passed down for millennia. He has recently sensed that the forest "
                        "is trying to send a message to the outside world, and he believes "
                        "you are the messenger."
                    ),
                    "voiceStyle": "sparse, measured, pausing between thoughts, speaking in parables, gentle authority",
                    "greetingMessage": (
                        "The forest told me you were coming. Three days ago, the harpy eagle "
                        "circled the village twice at dawn — that is the sign. You have "
                        "walked with the plant woman, listened to the river man, and spoken "
                        "with the blue bird. Now you come to me. Good. I am Raoni. I will "
                        "not test your knowledge — the forest does not care what you know. "
                        "I will test your heart. Are you ready to listen to what the trees "
                        "have been trying to say?"
                    ),
                },
                "challenge": {
                    "type": "reflection",
                    "description": (
                        "Participate in a ceremony with Shaman Raoni. He guides you through "
                        "a ritualized conversation about humanity's relationship with nature, "
                        "the meaning of the expedition's encounters, and what the forest's "
                        "message might be. This is a test of empathy, openness, and the "
                        "ability to see the world through a different cultural lens."
                    ),
                    "successCriteria": (
                        "The user participates respectfully in the ceremony, demonstrating "
                        "openness to indigenous perspectives, offering genuine reflection "
                        "on humanity's relationship with nature, and articulating what the "
                        "forest's message might mean. Cultural sensitivity and emotional "
                        "authenticity are essential."
                    ),
                    "failureHints": [
                        "Raoni values listening above speaking. Sometimes silence IS the answer.",
                        "Connect your experiences: the plants, the river, the animals — what pattern emerges?",
                        "Approach the ceremony with respect and openness, not with the need to 'win.'",
                    ],
                    "maxAttempts": 3,
                },
                "points": 125,
                "hints": [
                    "The Amazon produces 20% of the world's oxygen — the forest literally keeps us alive.",
                    "Indigenous peoples have protected 80% of the world's remaining biodiversity.",
                    "Raoni's message may be simple: the forest is not a resource — it is a relative.",
                ],
            },
        ],
    })

    return quests


def seed_quests(env_name="dev"):
    """Seed quests into DynamoDB."""
    table_name = f"{env_name}-qm-quests"
    dynamodb = boto3.resource("dynamodb", region_name="eu-west-1")
    table = dynamodb.Table(table_name)

    quests = build_quests()

    for quest in quests:
        table.put_item(Item=quest)
        print(f"Seeded quest: {quest['title']} ({quest['id']})")

    print(f"\nSuccessfully seeded {len(quests)} quests into {table_name}")


if __name__ == "__main__":
    env = sys.argv[1] if len(sys.argv) > 1 else "dev"
    seed_quests(env)
