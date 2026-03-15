#!/usr/bin/env python3
"""Seed QuestMaster with 5 amazing quests."""
import boto3
import uuid
import sys
from datetime import datetime, timezone


def generate_id():
    return str(uuid.uuid4())


def build_quests():
    """Build the 5 seed quests with full detailed content."""
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
