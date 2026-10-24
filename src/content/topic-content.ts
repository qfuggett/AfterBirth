/**
 * Draft educational summaries for each catalog topic.
 *
 * Written from the research catalog's coverage notes and limitations.
 * NONE of this has been clinically reviewed. Topics whose sources were only
 * partially available are marked "outline" and deliberately avoid detailed
 * instructions.
 */

export type ImageKey =
  | "hero"
  | "hospital"
  | "goingHome"
  | "atHome"
  | "complications"
  | "support"
  | "questions"
  | "myCare"
  | "findCare";

export type TopicContent = {
  summary: string;
  next: { title: string; text: string };
  mayHappen?: string[];
  why?: string[];
  varies?: string[];
  questions: string[];
  /** Always-visible safety or fact box (never collapsed). */
  keyFacts?: string[];
  urgent?: "maternal" | "baby";
  draftLevel: "draft" | "outline";
  outlineNote?: string;
  image: ImageKey;
  keywords: string[];
  sensitive?: boolean;
};

export const TOPIC_CONTENT: Record<string, TopicContent> = {
  "hospital-orientation": {
    summary:
      "After birth, nurses check on both of you regularly, and a baby care team checks your newborn. Many hospitals keep the baby in your room (rooming-in) so you can learn together.",
    next: {
      title: "Ask who is who",
      text: "It is fine to ask each person their name and role, and who to call with a question.",
    },
    mayHappen: [
      "Regular visits from nurses for you and checks for your baby.",
      "Identification bracelets for you, your baby and often a support person.",
      "Feeding help and newborn-care teaching during your stay.",
    ],
    why: ["Close checks in the first hours and days help staff notice changes early for both of you."],
    varies: [
      "Each hospital and unit runs its own routine. Rooming-in, visitor rules and team roles differ between hospitals.",
    ],
    questions: [
      "Who is my nurse today, and who is caring for my baby?",
      "How do I reach someone if I have a question?",
      "Will my baby stay in the room with me?",
    ],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["nurse", "team", "after delivery", "rooming in", "who", "staff", "care team"],
  },
  "routine-checks": {
    summary:
      "Staff check your bleeding, press gently on your belly to feel your uterus, and take your blood pressure, pulse and temperature. These checks look for heavy bleeding, infection and blood-pressure problems early.",
    next: {
      title: "Tell staff about changes",
      text: "Tell your nurse if bleeding increases, you feel dizzy or faint, or something feels wrong. You do not need to wait for the next check.",
    },
    mayHappen: [
      "A nurse presses on your lower belly to check that the uterus is firm and shrinking. This can be uncomfortable.",
      "Pads may be looked at to see how much you are bleeding.",
      "Vital signs such as blood pressure, pulse and temperature are taken repeatedly.",
    ],
    why: [
      "A uterus that stays soft can be linked with heavier bleeding. Repeated vital signs help spot bleeding, infection or high blood pressure.",
    ],
    varies: ["How often checks happen depends on your birth, your health and the hospital's routine."],
    questions: [
      "Why are you checking my belly, and what are you feeling for?",
      "Is my bleeding the amount you expect right now?",
      "How often will these checks happen?",
    ],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["fundal", "belly", "pressing", "uterus", "vitals", "vital signs", "check bleeding", "massage"],
  },
  "vaginal-recovery": {
    summary:
      "After a vaginal birth, soreness, swelling and stitches are common. A peri bottle (a small squeeze bottle of warm water) is often used to rinse the area when you use the toilet.",
    next: {
      title: "Follow your own wound-care sheet",
      text: "Your hospital's discharge instructions for stitches come first. Ask your nurse to show you how they want you to care for the area.",
    },
    mayHappen: [
      "Soreness or swelling in the area between the vagina and anus (perineum).",
      "Stitches that dissolve on their own, if you had a tear or cut.",
      "Being shown how to use a peri bottle and pads.",
    ],
    why: ["Keeping the area clean and comfortable supports healing."],
    varies: [
      "Care depends on whether you had a tear and how deep it was. Specific products and routines differ by hospital.",
    ],
    questions: [
      "Do I have stitches, and how should I care for them?",
      "What can I use for pain or swelling?",
      "What signs would mean the area is not healing well?",
    ],
    keyFacts: [
      "The wound-care handout in our catalog (University of Michigan) has moved to a new library address and must be relocated before this page can be finalized.",
    ],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["stitches", "peri bottle", "perineum", "tear", "sore", "vaginal birth", "swelling"],
  },
  "cesarean-recovery": {
    summary:
      "A C-section is major surgery. Staff help you get up and move when it is safe, check your incision, and watch for infection, blood clots and effects of anesthesia.",
    next: {
      title: "Ask before you get up the first time",
      text: "Ask your nurse to help the first time you stand or walk after surgery.",
    },
    mayHappen: [
      "A dressing over your incision, checked by staff.",
      "Help getting out of bed and walking, often within your stay.",
      "Questions about pain, gas, passing urine and leg swelling.",
    ],
    why: [
      "Moving when allowed can lower the chance of blood clots. Incision checks help spot infection early.",
    ],
    varies: [
      "Timing for eating, walking, removing a catheter or changing the dressing depends on your surgery and hospital.",
    ],
    questions: [
      "When can I get up, and should someone help me?",
      "How do I care for my incision at home?",
      "What signs of infection should I watch for?",
    ],
    keyFacts: ["Our sources do not provide a complete C-section discharge protocol. Use the written instructions you receive."],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["c-section", "cesarean", "caesarean", "incision", "surgery", "scar", "csection"],
  },
  "pain-plan": {
    summary:
      "Pain after birth is expected, and you can ask for help with it. Your care team chooses pain medicines based on your birth, your health and whether you are feeding with breast milk.",
    next: {
      title: "Say when pain is not controlled",
      text: "If your pain medicine is not helping, tell your nurse. Do not change doses on your own.",
    },
    mayHappen: ["Regular questions about your pain level.", "Medicines given on a schedule or when you ask."],
    why: ["Good pain control helps you rest, move and care for your baby."],
    varies: ["Medicine choices, timing and limits are set by your own care team."],
    questions: [
      "What is this pain medicine and how often can I take it?",
      "What should I do if the pain is not getting better?",
      "Is this medicine okay if I am feeding my baby breast milk?",
    ],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["pain", "pain relief", "medicine", "ibuprofen", "opioid", "hurts", "sore"],
  },
  "bathroom-recovery": {
    summary:
      "Peeing and the first bowel movement can feel daunting after birth. Hemorrhoids are common. Staff often check that you can pass urine.",
    next: {
      title: "Tell your nurse if you cannot pee",
      text: "If you cannot pass urine, or feel you cannot empty your bladder, tell your nurse.",
    },
    mayHappen: [
      "Stinging when you pee, especially with stitches.",
      "Being offered a stool softener (your team decides if it is right for you).",
      "Swollen, sore hemorrhoids.",
    ],
    why: ["A bladder that does not empty properly may need treatment. Constipation and straining can add discomfort."],
    varies: ["Medicines offered and how bladder emptying is checked differ by hospital."],
    questions: [
      "Do I need to show that I can pee before going home?",
      "What can help with constipation or hemorrhoids?",
      "Is it safe to take a stool softener with my other medicines?",
    ],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["pee", "poop", "bowel", "constipation", "hemorrhoids", "toilet", "urinate", "scared to poop"],
  },
  "bleeding-and-cramps": {
    summary:
      "Bleeding and discharge after birth (lochia) are normal and change over the following weeks. Cramping is common, especially while feeding. Very heavy bleeding is a warning sign.",
    next: {
      title: "Know the warning sign",
      text: "Heavy vaginal bleeding or fluid that smells bad needs medical care right away. Call 911 in an emergency.",
    },
    keyFacts: [
      "CDC lists heavy vaginal bleeding or leaking fluid that smells bad after pregnancy as an urgent maternal warning sign.",
    ],
    mayHappen: [
      "Bleeding that is heavier at first and gradually lightens and changes color.",
      "Cramps as the uterus shrinks.",
    ],
    why: ["The uterus is healing where the placenta was attached."],
    varies: [
      "Sources disagree on how long to wait before calling about bleeding. We follow CDC's warning signs rather than a longer waiting period.",
    ],
    questions: [
      "How much bleeding is expected for me right now?",
      "What amount of bleeding should make me call, and who do I call?",
    ],
    urgent: "maternal",
    draftLevel: "draft",
    image: "atHome",
    keywords: ["lochia", "bleeding", "discharge", "cramps", "cramping", "clots", "blood"],
  },
  "food-drink-movement": {
    summary:
      "Most people can eat and drink after birth, but some treatments or surgery may mean waiting or getting up only with help. Ask your nurse what applies to you.",
    next: {
      title: "Ask what your limits are today",
      text: "Food and activity limits depend on your treatment. There is no single rule that applies to everyone.",
    },
    mayHappen: [
      "Being asked to wait before eating after surgery or certain treatments.",
      "Needing help to walk while connected to an IV or monitoring.",
    ],
    why: ["Limits are usually about safety during or after a procedure, medicine or monitoring."],
    varies: [
      "Our research did not find a universal fasting rule linked to magnesium treatment. Ask your own team.",
    ],
    questions: [
      "What can I eat or drink right now?",
      "Can I walk with this IV, and should someone be with me?",
      "When will these limits change?",
    ],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["eat", "food", "drink", "walk", "iv", "fasting", "hungry", "nothing by mouth", "get up"],
  },
  "feeding-support": {
    summary:
      "You can ask for help with feeding, whether you use breast milk, formula or both. Hospitals often have nurses or lactation consultants who can help.",
    next: {
      title: "Ask for feeding help early",
      text: "Ask your nurse who can help you feed your baby and how to reach them.",
    },
    mayHappen: ["Help with positioning, latch, bottle feeding or pumping.", "Questions about how often your baby is feeding."],
    why: ["Early support can make feeding easier and help spot problems."],
    varies: ["Availability of lactation consultants varies by hospital and time of day."],
    questions: [
      "Who can help us with feeding?",
      "How do we know our baby is getting enough?",
      "Can we use formula, and how do we prepare it safely?",
    ],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["feeding", "breastfeeding", "formula", "bottle", "latch", "lactation", "nursing", "chestfeeding"],
  },
  "milk-pumping-separation": {
    summary:
      "Milk may take time to come in, and it can be delayed after some births. If you are separated from your baby, pumping or hand expression can help, and staff can show you how.",
    next: {
      title: "Ask for a feeding assessment",
      text: "If you are worried about milk supply or your baby's feeding, ask for help rather than waiting.",
    },
    mayHappen: ["Being shown a breast pump or hand expression.", "Help storing milk for a baby in special care."],
    why: ["Regular milk removal is part of how milk supply builds."],
    varies: [
      "Milk arrival timing differs for each person. We do not promise a fixed day for milk to come in.",
    ],
    questions: [
      "Can someone show me how to pump or hand express?",
      "How do I store and label milk for my baby?",
      "Who can check whether my baby is getting enough?",
    ],
    draftLevel: "draft",
    image: "support",
    keywords: ["milk", "pumping", "pump", "separated", "supply", "nicu milk", "hand expression"],
  },
  "newborn-checks": {
    summary:
      "Before you go home, your baby has several routine checks and screening tests, such as a small heel-prick blood test and a hearing check.",
    next: {
      title: "Ask which tests are done and when results arrive",
      text: "Ask your baby's care team which tests are planned and how you will hear about results.",
    },
    mayHappen: ["Physical exams by the baby care team.", "A heel prick to collect a few drops of blood for screening.", "A hearing test."],
    why: ["Screening finds some conditions early, before a baby shows signs."],
    varies: ["The exact set and timing of tests depends on the hospital and your baby's needs."],
    questions: [
      "Which tests will my baby have before we leave?",
      "How and when will we get the results?",
      "What follow-up does my baby need?",
    ],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["heel prick", "screening", "newborn test", "hearing test", "baby exam", "jaundice"],
  },
  "baby-security": {
    summary:
      "Hospitals use matching ID bracelets and other safety steps so that your baby only leaves the room with the right people.",
    next: {
      title: "Check badges",
      text: "It is okay to check a staff member's ID badge before handing over your baby.",
    },
    mayHappen: ["Bracelets checked when the baby leaves or returns to the room.", "Rules about who may carry the baby in hallways."],
    why: ["These steps protect babies from mix-ups and from being taken by someone unauthorized."],
    varies: ["Security procedures are specific to each hospital."],
    questions: ["Who is allowed to take my baby out of the room?", "What should I do if someone without a badge asks for my baby?"],
    draftLevel: "draft",
    image: "hospital",
    keywords: ["bracelet", "id band", "security", "badge", "who can take baby"],
  },
  "safe-sleep": {
    summary:
      "Babies should sleep on their back, on a firm, flat surface of their own, with nothing else in the sleep space. When you are exhausted, plan who will watch the baby so you can rest safely.",
    next: {
      title: "If you feel yourself falling asleep",
      text: "Put your baby down on their back in their own safe sleep space, or hand them to someone who is awake.",
    },
    keyFacts: [
      "Back to sleep, every sleep.",
      "Firm, flat surface such as a crib or bassinet, with a fitted sheet.",
      "Keep soft objects, pillows and loose bedding out of the baby's sleep space.",
      "Sofas, armchairs and adult beds are not safe sleep places for babies.",
    ],
    why: ["These steps lower the risk of sleep-related infant deaths, according to CDC."],
    varies: ["Ask your baby's clinician about any special sleep instructions for your baby."],
    questions: [
      "Can you show us how to set up a safe sleep space?",
      "What should we do if the baby will only sleep when held?",
    ],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["sleep", "safe sleep", "crib", "bassinet", "co-sleeping", "bed sharing", "falling asleep holding baby", "chest"],
  },
  "newborn-basics": {
    summary:
      "Nurses can show you how to change diapers, care for the umbilical cord stump and bathe your baby. Ask them to show you, then try it while they watch.",
    next: { title: "Ask for a demonstration", text: "Ask a nurse to show you a diaper change or cord care before you leave." },
    mayHappen: ["Practising diaper changes and swaddling with a nurse.", "Being told how to keep the cord stump clean and dry."],
    why: ["Hands-on practice builds confidence before going home."],
    varies: ["Advice on cord care and first baths can differ. Follow your baby's care team."],
    questions: [
      "Can you show me how to change a diaper and clean the cord area?",
      "When can we give the first bath at home?",
      "How many wet and dirty diapers should we expect?",
    ],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["diaper", "cord", "umbilical", "bath", "bathing", "swaddle", "nappy"],
  },
  "baby-needs-extra-care": {
    summary:
      "Some babies need extra monitoring, such as blood sugar checks, or care in a neonatal intensive care unit (NICU). This can be frightening. You can ask the team to explain what is happening and how you can be involved.",
    next: {
      title: "Ask what is being watched",
      text: "Ask what the team is checking, what would change the plan, and how you can be with your baby.",
    },
    mayHappen: [
      "Blood sugar checks, for example after a pregnancy with gestational diabetes.",
      "A longer stay or transfer to a NICU or special care nursery.",
    ],
    why: ["Some babies need more time or support to adjust after birth."],
    varies: ["Each baby's needs and each NICU's routines are different."],
    questions: [
      "Why does my baby need extra care, and what are you watching for?",
      "How can I be with my baby and help with care?",
      "Who can I talk to about how I am feeling?",
    ],
    draftLevel: "draft",
    image: "support",
    sensitive: true,
    keywords: ["nicu", "special care", "blood sugar", "baby sugar", "staying longer", "premature", "neonatal"],
  },
  "support-person-hospital": {
    summary:
      "Fathers, partners and other support people can help a lot: getting water, holding the baby, learning care, and watching for warning signs. Visitor and overnight rules differ by hospital.",
    next: { title: "Ask about overnight stays", text: "Check your hospital's current visitor rules before planning to stay overnight." },
    mayHappen: ["Learning diaper changes, feeding support and soothing.", "Helping the recovering parent rest and move safely."],
    why: ["Shared care helps the recovering parent rest."],
    varies: ["Visitor policies are live hospital rules that change. Recheck them for your hospital."],
    questions: ["Can I stay overnight?", "What can I do to help right now?", "What warning signs should I watch for?"],
    draftLevel: "draft",
    image: "hero",
    keywords: ["dad", "father", "partner", "support person", "visitor", "overnight", "what can dad do"],
  },
  "discharge-readiness": {
    summary:
      "Before you go home, staff usually check that you and your baby are ready, explain your instructions, and make sure follow-up appointments are planned.",
    next: {
      title: "Ask what is still needed",
      text: "Ask your nurse what still needs to happen before discharge. Your hospital's own list is what counts.",
    },
    mayHappen: [
      "Final checks for you and your baby.",
      "Going over medicines, warning signs and appointments.",
      "A car seat check may be part of leaving.",
    ],
    why: ["These steps help make sure you can safely continue recovery at home."],
    varies: ["Discharge steps and timing differ by hospital and by your and your baby's health."],
    questions: [
      "What needs to happen before we can go home?",
      "Who do we call with questions after we leave?",
      "Can you go over my medicines and warning signs with me?",
    ],
    draftLevel: "draft",
    image: "goingHome",
    keywords: ["discharge", "going home", "leave", "ready to go home", "why aren't we discharged"],
  },
  paperwork: {
    summary:
      "Leaving the hospital usually involves paperwork for your baby and appointments for both of you. Keep your papers together and photograph them for safekeeping.",
    next: {
      title: "Save your papers",
      text: "Take photos of discharge papers and appointment cards and keep them in My care.",
    },
    mayHappen: ["Forms for your baby's birth record.", "A first appointment for your baby and a follow-up plan for you."],
    why: ["Early follow-up appointments help catch problems."],
    varies: ["Timing of your baby's first visit is set by your care team. Published timings do not replace your own instructions."],
    questions: ["When is my baby's first appointment?", "When is my own follow-up?", "Which forms do we still need to complete?"],
    draftLevel: "draft",
    image: "myCare",
    keywords: ["paperwork", "birth certificate", "forms", "appointment", "first appointment", "documents"],
  },
  "home-first-days": {
    summary:
      "The first days at home are about rest, feeding, healing and getting help. Having supplies ready and a plan for who does what makes the first nights easier.",
    next: { title: "Plan the first night", text: "Agree who will handle feeds, diapers and meals so the recovering parent can rest." },
    mayHappen: ["Broken sleep for everyone.", "Visitors who want to help or visit."],
    why: ["Physical and emotional recovery both need time and support."],
    varies: ["Every family's situation is different, including single parents and families without nearby help."],
    questions: ["Who can help us in the first week?", "What supplies do I need for my recovery?"],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["first days", "home", "first night", "supplies", "prepare", "recovery plan"],
  },
  "home-medications": {
    summary:
      "Follow the medicine plan in your discharge instructions. Do not stop or change a prescribed medicine, including blood-pressure medicine, without talking to your care team.",
    next: {
      title: "Ask before changing anything",
      text: "Call your care team if you have side effects or questions about a medicine.",
    },
    keyFacts: ["This app does not tell you which medicines to take or change. Your own written instructions and care team decide."],
    why: ["Some medicines, such as blood-pressure medicines, may be adjusted after birth by your care team."],
    varies: ["Each person's medicines, doses and length of treatment are individual."],
    questions: [
      "Which medicines do I keep taking, and for how long?",
      "What side effects should I call about?",
      "Who adjusts my blood pressure medicine?",
    ],
    draftLevel: "draft",
    image: "myCare",
    keywords: ["medicine", "medication", "pills", "prescription", "blood pressure medicine", "dose"],
  },
  "rest-support": {
    summary:
      "Rest is part of recovery. Sharing night care, accepting practical help, and asking about community programs can make a real difference.",
    next: { title: "Make a rest plan", text: "Take turns with night care if you can, and pair rest with safe-sleep steps for your baby." },
    mayHappen: ["Feeling exhausted even when you get some sleep.", "Needing help with meals, chores or older children."],
    why: ["Recovery and mood are both affected by sleep and support."],
    varies: ["If you have no help at home, community programs may be able to assist. Availability varies."],
    questions: ["How can my partner or family help me rest?", "Are there community programs that can help us?"],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["rest", "sleep", "tired", "exhausted", "help at home", "no help", "support"],
  },
  "mood-and-bonding": {
    summary:
      "Many new parents feel tearful, anxious or overwhelmed in the first days. Bonding can take time. If low mood or anxiety lasts, gets worse or feels severe, ask for help. You do not need to wait.",
    next: {
      title: "If you have thoughts of harming yourself or your baby",
      text: "Get help right away. Call or text 988, or call 911 in an emergency.",
    },
    keyFacts: [
      "Severe symptoms or safety concerns should not wait two weeks.",
      "988 Suicide & Crisis Lifeline: call or text 988.",
    ],
    mayHappen: ["Crying, mood swings, worry or trouble sleeping.", "Not feeling an instant bond with your baby."],
    why: ["Hormone changes, lack of sleep and a major life change all affect mood."],
    varies: ["Short-lived 'baby blues' are different from postpartum depression, which needs treatment."],
    questions: ["Is how I am feeling something to get checked?", "Who can I talk to about my mood?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "support",
    keywords: ["crying", "sad", "mood", "baby blues", "bond", "bonding", "anxious", "depressed", "overwhelmed"],
  },
  "father-mental-health": {
    summary:
      "Fathers and non-birth parents can also feel depressed, anxious or overwhelmed after a baby arrives. Their sleep and emotional health matter too.",
    next: { title: "Talk to someone", text: "If you are struggling, talk to your own doctor. Call or text 988 if you are in crisis." },
    mayHappen: ["Exhaustion, worry, irritability or feeling disconnected."],
    why: ["Big changes in sleep, roles and relationships affect every parent."],
    varies: ["Support options differ. Your own primary care clinician is a good starting point."],
    questions: ["Can I be checked for depression or anxiety?", "Where can new dads or partners get support?"],
    draftLevel: "draft",
    image: "hero",
    keywords: ["dad depression", "father", "partner", "non-birth parent", "new dad", "overwhelmed dad"],
  },
  followup: {
    summary:
      "Postpartum care is ongoing. ACOG recommends contact with your care team within the first three weeks rather than waiting six weeks, and some people need to be seen sooner.",
    next: {
      title: "Book your follow-up",
      text: "Check your discharge papers for when to be seen, and call to book if it is not already scheduled.",
    },
    keyFacts: [
      "People with high blood pressure in pregnancy may need a blood-pressure check much sooner. Follow your own instructions.",
    ],
    why: ["Recovery covers physical healing, mood, feeding, sleep, contraception and long-term health."],
    varies: [
      "The ACOG guidance in our catalog is from 2018 and must be re-verified. General timing is not enough for higher-risk patients.",
    ],
    questions: ["When should I be seen after birth?", "Do I need an earlier blood-pressure check?"],
    draftLevel: "draft",
    image: "goingHome",
    keywords: ["follow up", "six weeks", "6 week", "checkup", "postpartum visit", "appointment"],
  },
  "pelvic-floor-sex": {
    summary:
      "Leaking urine, pelvic pain or heaviness can happen after birth, and help is available, including pelvic-floor assessment. Talk with your care team about when to return to exercise, sex and contraception.",
    next: { title: "Mention symptoms", text: "Tell your clinician about leaking, pain or bowel changes. They are common but treatable." },
    mayHappen: ["Some leaking when coughing or lifting.", "Questions about contraception at your follow-up."],
    why: ["Pregnancy and birth stretch and sometimes injure pelvic tissues."],
    varies: ["When to resume sex and exercise depends on your healing and your clinician's advice."],
    questions: [
      "I am leaking urine. Can I be referred for pelvic-floor care?",
      "When is it safe for me to have sex or exercise again?",
      "What contraception options suit me?",
    ],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["pelvic floor", "leaking", "incontinence", "sex", "contraception", "birth control", "exercise"],
  },
  "community-help": {
    summary:
      "Detroit-area and Michigan programs offer home visits, community health workers and family support through the first year. Eligibility and availability need to be confirmed with each program.",
    next: {
      title: "Contact a program to check eligibility",
      text: "Open the program sources below and call to ask whether you qualify.",
    },
    mayHappen: ["Nurse or social-worker visits.", "Help connecting with community resources."],
    why: ["Practical and emotional support improves recovery for many families."],
    varies: [
      "Programs listed are Henry Ford Health's Women-Inspired Neighborhood Network and Michigan's Maternal Infant Health Program. Enrollment rules and coverage areas must be confirmed.",
    ],
    questions: ["Do we qualify for a home-visiting program?", "Can someone help us find local resources?"],
    draftLevel: "draft",
    image: "findCare",
    keywords: ["community", "home visit", "help", "program", "mihp", "win network", "social worker"],
  },
  preeclampsia: {
    summary:
      "Preeclampsia is a pregnancy-related high blood pressure condition. It can continue after birth or start for the first time after delivery, so blood pressure is watched closely.",
    next: {
      title: "Know the warning signs",
      text: "A headache that will not go away, vision changes, trouble breathing or severe swelling need care right away. Call 911 in an emergency.",
    },
    keyFacts: [
      "Preeclampsia can begin after birth, even if blood pressure was normal in pregnancy.",
      "CDC warning signs include a headache that won't go away or gets worse, changes in vision, and extreme swelling of hands or face.",
    ],
    mayHappen: [
      "Frequent blood-pressure checks and blood or urine tests.",
      "Blood-pressure medicine, and sometimes magnesium to prevent seizures.",
    ],
    why: ["High blood pressure after birth can lead to serious problems such as stroke or seizures if not treated."],
    varies: [
      "Our research did not find a universal food restriction or hourly blood-pressure schedule. Your hospital's plan applies.",
    ],
    questions: [
      "What is my blood-pressure plan while I am here and after I go home?",
      "Which symptoms should I report immediately?",
      "Do I need follow-up for my long-term heart health?",
    ],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["preeclampsia", "pre-eclampsia", "high blood pressure", "hypertension", "toxemia", "bp"],
  },
  magnesium: {
    summary:
      "Magnesium sulfate is given through an IV to help prevent seizures in some people with preeclampsia. Because it can affect breathing, reflexes and urine output, staff check you often while it runs.",
    next: {
      title: "Report how you feel",
      text: "Tell your nurse about trouble breathing, unusual weakness, or anything that feels wrong.",
    },
    mayHappen: [
      "Checks of breathing, reflexes (such as tapping your knee), urine output and alertness.",
      "Feeling warm, flushed, tired or weak while it runs.",
      "Staying in bed or getting up only with help.",
    ],
    why: [
      "Magnesium helps prevent eclamptic seizures. The monitoring helps staff make sure the level in your body stays safe.",
    ],
    varies: [
      "How long it runs and how often you are checked follow your hospital's policy. This page does not give doses.",
      "We found no universal rule that you cannot eat while on magnesium. Ask your team.",
    ],
    questions: [
      "What is the magnesium for, and how long will I need it?",
      "Why do you check my reflexes and urine?",
      "Can I eat or drink while it is running?",
    ],
    draftLevel: "draft",
    image: "complications",
    keywords: ["magnesium", "mag", "magnesium sulfate", "drip", "reflexes", "mgso4", "magnisium"],
  },
  "blood-pressure-monitoring": {
    summary:
      "If your blood pressure is high, staff may check it often to see whether treatment is working and whether it is rising. At home, some programs give you a cuff and tell you how often to check.",
    next: {
      title: "Ask what number means call",
      text: "Ask your team what readings or symptoms mean you should call or seek urgent care. This app does not interpret readings.",
    },
    mayHappen: ["Repeated readings, sometimes at night.", "Medicine adjustments based on readings."],
    why: ["Blood pressure can change quickly after birth, especially after preeclampsia."],
    varies: [
      "No universal hourly schedule was established in our research. Home-monitoring schedules are specific to programs such as MiHeart (University of Michigan).",
    ],
    questions: [
      "How often will my blood pressure be checked, and what are you watching for?",
      "How often should I check it at home, and who reviews the readings?",
    ],
    draftLevel: "draft",
    image: "complications",
    keywords: ["blood pressure check", "bp check", "every hour", "cuff", "readings", "monitoring"],
  },
  "blood-pressure-home": {
    summary:
      "After a blood-pressure complication, you may go home with a cuff, medicines and a follow-up plan. Some health systems run remote monitoring programs, such as Henry Ford's Heart Healthy Moms or University of Michigan's MiHeart.",
    next: {
      title: "Confirm who reviews your readings",
      text: "Before leaving, ask who will look at your home readings and how to reach them.",
    },
    keyFacts: [
      "Remote monitoring programs are not emergency services. For warning signs, seek care right away or call 911.",
    ],
    mayHappen: ["Training on using a home cuff.", "Virtual visits or text check-ins in some programs."],
    why: ["Close follow-up helps adjust medicine and protects long-term heart health."],
    varies: ["Eligibility and access differ by program and must be confirmed."],
    questions: ["Do I need a cuff, and how do I use it?", "Who reviews my readings?", "Am I eligible for a monitoring program?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "goingHome",
    keywords: ["cuff", "home monitoring", "heart healthy moms", "miheart", "readings at home"],
  },
  "hellp-eclampsia": {
    summary:
      "Sometimes preeclampsia becomes more severe. Eclampsia means seizures. HELLP syndrome affects the blood and liver. Both need urgent specialist care in hospital.",
    next: { title: "Seizure or severe symptoms", text: "Call 911 for a seizure, severe headache with vision changes, or severe belly pain." },
    keyFacts: ["HELLP stands for Hemolysis, Elevated Liver enzymes and Low Platelets."],
    why: ["These complications can be life-threatening and are treated in hospital."],
    varies: ["Treatment depends on the person and the hospital's specialist team."],
    questions: ["What does HELLP mean for my recovery?", "What follow-up do I need?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["hellp", "eclampsia", "seizure", "severe preeclampsia", "liver", "platelets"],
  },
  hemorrhage: {
    summary:
      "Postpartum hemorrhage means very heavy bleeding after birth. Staff may give medicines such as oxytocin to help the uterus contract, and other treatments if bleeding continues.",
    next: { title: "Heavy bleeding now", text: "Heavy bleeding, feeling faint or a racing heart need emergency care. Call 911 or tell staff immediately." },
    mayHappen: ["Medicine to help the uterus contract.", "Close monitoring, IV fluids and sometimes blood transfusion or procedures."],
    why: ["A uterus that does not contract well is a common cause of heavy bleeding."],
    varies: ["Treatment depends on the cause and amount of bleeding."],
    questions: ["What happened, and why did I need that treatment?", "What should I watch for at home?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["hemorrhage", "haemorrhage", "pph", "oxytocin", "pitocin", "heavy bleeding", "blood loss"],
  },
  anemia: {
    summary:
      "After significant blood loss, you may feel weak, tired or dizzy. Your care team may check your blood count and talk with you about iron or, sometimes, a transfusion.",
    next: { title: "Report dizziness or fainting", text: "Dizziness or fainting is a warning sign. Seek care right away." },
    mayHappen: ["Blood tests.", "Iron treatment or, in some cases, a transfusion."],
    why: ["Losing blood lowers the cells that carry oxygen around the body."],
    varies: ["Treatment depends on your blood count and symptoms."],
    questions: ["Do I need iron or a transfusion?", "How long might I feel weak?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["anemia", "anaemia", "iron", "transfusion", "weak", "dizzy", "blood count"],
  },
  infection: {
    summary:
      "Infections after birth can affect the uterus, bladder or a wound. Fever, worsening pain, foul-smelling discharge or a red, swollen wound need medical review.",
    next: { title: "Fever of 100.4°F or higher", text: "CDC lists a fever of 100.4°F (38°C) or higher as an urgent warning sign. Get care right away." },
    keyFacts: [
      "Use CDC's threshold: 100.4°F (38°C). Some older local handouts use a higher number; we do not.",
    ],
    mayHappen: ["Tests to find the cause.", "Antibiotics, sometimes through an IV."],
    why: ["Birth and surgery can allow bacteria to enter the uterus, bladder or wounds."],
    varies: ["Treatment depends on where the infection is and how severe it is."],
    questions: ["Why am I getting antibiotics, and for how long?", "What signs mean the infection is getting worse?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["infection", "infected", "fever", "antibiotics", "endometritis", "uti", "wound red", "incision infected"],
  },
  "blood-clots": {
    summary:
      "The risk of blood clots is higher after birth. A swollen, red or painful leg, or sudden chest pain or trouble breathing, needs urgent care.",
    next: { title: "Chest pain or trouble breathing", text: "Call 911. A clot in the lung is an emergency." },
    keyFacts: ["CDC warning signs include swelling, redness or pain of your leg, trouble breathing, and chest pain."],
    mayHappen: ["An ultrasound of the leg.", "Blood thinners if a clot is found."],
    why: ["Pregnancy changes blood clotting, and surgery or less movement can add to the risk."],
    varies: ["Our source is a general vascular page, not postpartum prescribing guidance."],
    questions: ["Why do I need an ultrasound?", "How long will I need treatment?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["clot", "dvt", "blood clot", "leg swollen", "pulmonary embolism", "calf pain", "ultrasound"],
  },
  headache: {
    summary:
      "A headache after birth needs to be assessed, not self-diagnosed. It can relate to high blood pressure, an epidural (sometimes treated with a blood patch), or other causes.",
    next: {
      title: "Severe or lasting headache",
      text: "A headache that won't go away or gets worse, especially with vision changes, needs care right away.",
    },
    keyFacts: ["CDC lists a headache that won't go away or gets worse over time as an urgent maternal warning sign."],
    mayHappen: ["Blood-pressure checks.", "Assessment by anesthesia staff if you had an epidural or spinal."],
    why: ["Different causes need different treatment, and some are urgent."],
    varies: ["A blood patch is one treatment for a specific type of headache after an epidural. Only a clinician can decide if it fits."],
    questions: ["What could be causing my headache?", "What is a blood patch, and do I need one?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["headache", "spinal headache", "blood patch", "epidural headache", "migraine"],
  },
  "severe-tear": {
    summary:
      "Some births cause deeper tears (third- or fourth-degree) that involve the muscles around the anus. Specialist care is available for pain, bladder and bowel symptoms.",
    next: { title: "Ask about specialist follow-up", text: "Ask whether you should be referred to a pelvic-floor or postpartum healing clinic." },
    mayHappen: ["Problems controlling gas or stool.", "Pelvic pain or pain with sex."],
    why: ["Deeper tears may need extra assessment and treatment to heal well."],
    varies: [
      "University of Michigan's Healthy Healing After Delivery program states it is available regardless of delivery hospital; check current scheduling and coverage.",
    ],
    questions: ["What degree of tear did I have?", "Can I be referred to a pelvic-floor specialist?"],
    draftLevel: "draft",
    image: "atHome",
    keywords: ["third degree", "fourth degree", "tear", "bowel control", "incontinence", "pelvic pain"],
  },
  "urinary-retention": {
    summary:
      "Some people have trouble emptying the bladder after birth. Tell your nurse if you cannot pee or feel you are not emptying fully. A catheter is sometimes used.",
    next: { title: "Tell your nurse", text: "If you cannot pee, tell your nurse or care team promptly." },
    draftLevel: "outline",
    outlineNote:
      "Research draft only. We reviewed just an excerpt of the source handout, so we have not written catheter or home-care instructions.",
    questions: ["Why do I need a catheter?", "What should I do if I cannot empty my bladder at home?"],
    image: "complications",
    keywords: ["catheter", "can't pee", "bladder", "retention", "empty bladder"],
  },
  mastitis: {
    summary:
      "A red, painful, swollen area of the breast can be inflammation or sometimes infection. Contact your care team for assessment rather than treating it yourself.",
    next: { title: "Call your care team", text: "Call if you have a painful red area, especially with fever or feeling unwell." },
    mayHappen: ["Assessment by a clinician or lactation consultant.", "Advice on feeding or pumping during recovery."],
    why: ["Inflammation can happen when milk flow is blocked or tissue is irritated."],
    varies: [
      "Deep breast massage is no longer recommended by our source. Only a clinician can decide whether antibiotics are needed.",
    ],
    questions: ["Is this inflammation or infection?", "Should I keep feeding or pumping from this side?"],
    draftLevel: "draft",
    image: "complications",
    keywords: ["mastitis", "breast pain", "red breast", "blocked duct", "engorgement"],
  },
  "gestational-diabetes-followup": {
    summary:
      "Gestational diabetes often improves after birth, but follow-up glucose testing is still important because the risk of type 2 diabetes is higher later in life.",
    next: { title: "Ask when to be tested", text: "Ask your care team when your follow-up sugar test should be." },
    mayHappen: ["Blood sugar checks for your baby after birth.", "A glucose test for you weeks after birth."],
    why: ["Testing helps find diabetes early."],
    varies: ["We do not promise that birth cures diabetes. Follow-up timing is set by your clinician."],
    questions: ["Do I still have diabetes?", "When do I need another sugar test?"],
    draftLevel: "draft",
    image: "complications",
    keywords: ["gestational diabetes", "sugar test", "glucose", "diabetes"],
  },
  "heart-symptoms": {
    summary:
      "Shortness of breath, chest pain or a racing heart after birth must be checked. Rarely, the heart muscle weakens around pregnancy (peripartum cardiomyopathy).",
    next: { title: "Chest pain or trouble breathing", text: "Call 911 or seek emergency care now." },
    keyFacts: ["CDC lists trouble breathing and chest pain or fast-beating heart as urgent maternal warning signs."],
    mayHappen: ["Heart tests such as an ECG or ultrasound.", "Referral to cardio-obstetrics specialists."],
    why: ["Pregnancy places extra strain on the heart."],
    varies: ["Our sources do not give a fixed treatment sequence; care is specialist-led."],
    questions: ["What is causing my breathlessness?", "Do I need to see a heart specialist?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["short of breath", "breathless", "chest pain", "heart", "cardiomyopathy", "palpitations", "racing heart"],
  },
  "mental-health-treatment": {
    summary:
      "Postpartum depression and anxiety are common and treatable. Treatment can include talking therapy, support and, when appropriate, medicine. Severe symptoms need help right away.",
    next: {
      title: "Thoughts of harming yourself or your baby",
      text: "Call or text 988, or call 911 in an emergency.",
    },
    keyFacts: ["Do not wait two weeks if symptoms are severe or you feel unsafe."],
    mayHappen: ["A screening questionnaire at appointments.", "Referral to behavioral-health services."],
    why: ["Early treatment helps you feel better and supports your family."],
    varies: ["Program eligibility varies. Hospital behavioral-health programs are not crisis services."],
    questions: ["What treatment options are available?", "Can I be referred to a perinatal mental-health specialist?"],
    urgent: "maternal",
    draftLevel: "draft",
    image: "support",
    keywords: ["depression", "anxiety", "therapy", "postpartum depression", "ppd", "treatment", "can't sleep anxiety"],
  },
  "urgent-maternal": {
    summary: "Some symptoms after birth need medical care right away. If it is an emergency, call 911.",
    next: { title: "Call 911 in an emergency", text: "Tell them you were pregnant within the last year." },
    questions: [],
    urgent: "maternal",
    draftLevel: "draft",
    image: "complications",
    keywords: ["emergency", "warning signs", "urgent", "help now"],
  },
  "urgent-baby": {
    summary: "Some signs in a newborn need urgent care. If your baby is not breathing, call 911.",
    next: { title: "Call 911 in an emergency", text: "For a baby who is not breathing, is blue or cannot be woken." },
    questions: [],
    urgent: "baby",
    draftLevel: "draft",
    image: "complications",
    keywords: ["baby emergency", "newborn fever", "baby blue", "can't wake baby"],
  },
  "pregnancy-loss-trauma": {
    summary:
      "If your birth was frightening, or you experienced a loss, you deserve care and support. Reliving the birth, numbness or deep grief are understandable, and help is available.",
    next: {
      title: "You do not have to manage this alone",
      text: "Ask your care team about counseling or support services. If you have thoughts of harming yourself, call or text 988.",
    },
    mayHappen: ["Flashbacks, trouble sleeping or avoiding reminders.", "Grief that comes in waves."],
    why: ["Traumatic experiences and loss affect both body and mind."],
    varies: ["Support programs differ by health system. Eligibility needs to be confirmed."],
    questions: ["Who can I talk to about what happened?", "Can I be referred for counseling?"],
    draftLevel: "draft",
    image: "support",
    sensitive: true,
    keywords: ["loss", "stillbirth", "miscarriage", "trauma", "traumatic birth", "reliving", "frightening birth", "grief"],
  },
};
