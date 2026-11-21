/* ============================================================
     HOBBIES: edit this list to update the site.
     - about:   a short description of the hobby
     - since:   optional, e.g. "since 2022"
     - now:     optional, what you're currently working on
     - updates: newest first; add entries like
         { date: "2026-11-21", title: "New PR", text: "Hit a 185 lb deadlift." }
     - media:   optional photos/videos on an update. Put files in
                media/<hobby>/ and list them in order:
         { date: "2026-02-15", title: "Napa", text: "...",
           media: [
             { src: "media/travel/napa-vineyard.jpg", alt: "Rows of vines in Napa" },
             { src: "media/travel/waymo.mp4", caption: "First Waymo ride" }
           ] }
       Photos: .jpg/.png/.webp, Videos: .mp4/.webm/.mov.
       alt and caption are optional; poster sets a video's cover image.
     The "All" tab is built automatically from every hobby's updates.
     ============================================================ */
const HOBBIES = [
    {
      id: "lifting", name: "Lifting", since: "",
      icon: '<svg viewBox="0 0 48 48"><rect x="4" y="18" width="6" height="12" rx="1.5"/><rect x="38" y="18" width="6" height="12" rx="1.5"/><rect x="10" y="14" width="5" height="20" rx="1.5"/><rect x="33" y="14" width="5" height="20" rx="1.5"/><rect x="15" y="22.5" width="18" height="3" rx="1.5"/></svg>',
      about: "Strength training is my reset button. Progress you can measure, one plate at a time.",
      now: "",
      updates: []
    },
    {
      id: "pilates", name: "Pilates", since: "since June 2026",
      icon: '<svg viewBox="0 0 48 48"><circle cx="24" cy="10" r="4"/><path d="M24 15c-6 6-12 8-18 8M24 15c6 6 12 8 18 8M24 15v13l-8 14M24 28l8 14" fill="none" stroke-width="3" stroke-linecap="round"/></svg>',
      about: "The counterbalance to lifting: control, core, and the humbling burn of a slow movement.",
      now: "",
      updates: [
        { date: "2026-11-21", text: "I almost didn't finish my classes for the month before coming home for Thanksgiving. Let's just say there were 3 days this month that I went to Pilates twice a day. I am NOT wasting a class. But I have been noticing my shoulders looking and feeling a bit stronger. Motivated to get another DEXA soon to see my progress" },
        { date: "2026-10-01", text: "I bought the 12 class pack and am traveling quite a bit for the next few months, so I've been going to Pilates everyday. Honestly, I kinda like the boot camp like structure. But I have not been lifting as a result" },
        { date: "2026-09-01", text: "Pilates is such a game changer: it's given me a space to be more intentional with my movement and improve my mind to muscle connection." },
        { date: "2026-08-01", text: "I have been loving Pilates!! Recently, I've been going before work and it is such a great start to my day. Getting my body moving before the work day and before the sun rises has been great for my energy levels throughout the day" },
        { date: "2026-06-01", text: "Just started Pilates! I don't expect for it to be very hard because I've been lifting for years so I'm excited to try it out. I have a feeling I'll probably stop after a few months, especially because it is kind of expensive" }
      ]
    },
    {
      id: "travel", name: "Travel", since: "",
      icon: '<svg viewBox="0 0 48 48"><path d="M44 8 L4 22 L18 27 L22 42 L29 31 L38 36 Z"/></svg>',
      about: "New cities, new food, and getting a little lost on purpose. Always planning the next trip.",
      now: "",
      updates: [
        { date: "2026-02-28", title: "Atlanta", text: "Went to ATL to visit family.",
          media: [
            { src: "media/travel/atlanta-cafe.jpg", alt: "A café table with a latte topped with rose petals, a berry tart, a sesame bagel with cream cheese and a slice of pistachio roll cake" }
          ] },
        { date: "2026-02-15", title: "San Francisco & Napa", text: "Went to SF and saw Napa. Highlights: wine tasting with friends, trying Shizen (a 100% vegetarian restaurant), the best pastries in the US at Butter & Crumble, and riding in a Waymo for the first time.",
          media: [
            { src: "media/travel/napa-ruvango.jpg", alt: "Two glasses of red wine on a barrel on a winery porch, looking out over rows of vines and green hills in Napa" },
            { src: "media/travel/shizen-sushi.jpg", alt: "A vegetarian sushi roll topped with avocado and a flame at the end of the plate at Shizen" },
            { src: "media/travel/butter-and-crumble.jpg", alt: "A box of pastries from Butter & Crumble: a raspberry almond pastry, a pistachio pastry and a croissant topped with chocolate cream and a strawberry" }
          ] }
      ]
    },
    {
      id: "music", name: "Music", since: "",
      icon: '<svg viewBox="0 0 48 48"><path d="M18 34V10l22-5v24" fill="none" stroke-width="3" stroke-linejoin="round"/><ellipse cx="13" cy="34" rx="6" ry="5"/><ellipse cx="35" cy="29" rx="6" ry="5"/></svg>',
      about: "The soundtrack to every workout, every walk, and every long debugging session.",
      now: "",
      updates: []
    },
    {
      id: "reading", name: "Reading", since: "",
      icon: '<svg viewBox="0 0 48 48"><path d="M24 12C18 8 10 8 4 10v28c6-2 14-2 20 2 6-4 14-4 20-2V10c-6-2-14-2-20 2z"/></svg>',
      about: "Always have a book going. A mix of fiction and whatever nonfiction rabbit hole I'm in.",
      now: "",
      updates: []
    },
    {
      id: "cooking", name: "Cooking", since: "",
      icon: '<svg viewBox="0 0 48 48"><path d="M6 22h36v4c0 9-7 16-16 16h-4C13 42 6 35 6 26z"/><rect x="2" y="20" width="44" height="4" rx="2"/><path d="M17 14c0-3 3-3 3-6M24 14c0-3 3-3 3-6M31 14c0-3 3-3 3-6" fill="none" stroke-width="2.5" stroke-linecap="round"/></svg>',
      about: "Experimenting in the kitchen. Half recipe, half intuition, usually worth it.",
      now: "",
      updates: []
    }
  ];
