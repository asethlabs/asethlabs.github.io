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

     TRAVEL MAP: give a travel update `places: ["City, ST"]` and it shows
     on the map; spots glow hotter the more trips include them. Each place
     needs coordinates in PLACES below (look them up once, reuse forever).
     For trips without a post, add them to the Travel hobby's `visits`:
         visits: [ { date: "2025-07-04", places: ["Austin, TX"] } ]
     ============================================================ */
const PLACES = {
    "San Francisco, CA": [37.7749, -122.4194],
    "Napa, CA":          [38.2975, -122.2869],
    "Atlanta, GA":       [33.7490, -84.3880],
    "Chicago, IL":       [41.8781, -87.6298],
    "New York, NY":      [40.7128, -74.0060],
    "Boston, MA":        [42.3601, -71.0589],
    "Nashville, TN":     [36.1627, -86.7816],
    "Miami, FL":         [25.7617, -80.1918],
    "Orlando, FL":       [28.5384, -81.3789],
    "Arizona":           [34.2, -111.7],
    "San Diego, CA":     [32.7157, -117.1611],
    "Olympic National Park, WA": [47.8021, -123.6044],
    "Iceland":           [64.1466, -21.9426],
    "Delhi, India":      [28.6139, 77.2090],
    "Amritsar, India":   [31.6340, 74.8723],
    "Rishikesh, India":  [30.0869, 78.2676],
    "Uttar Pradesh, India":   [26.85, 80.95],
    "Madhya Pradesh, India":  [23.5, 78.0],
    "Banff, Canada":     [51.1784, -115.5708],
    "Osaka, Japan":      [34.6937, 135.5023],
    "Kyoto, Japan":      [35.0116, 135.7681],
    "Hiroshima, Japan":  [34.3853, 132.4553],
    "Tokyo, Japan":      [35.6762, 139.6503],
    "Mount Fuji, Japan": [35.3606, 138.7274],
    "Las Vegas, NV":     [36.1699, -115.1398],
    "Sugar Mountain, NC": [36.1293, -81.8601],
    "Birmingham, AL":    [33.5186, -86.8104],
    "Jamaica":           [18.1096, -77.2975],
    "Puerto Rico":       [18.2208, -66.5901]
  };
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
      visits: [
        { date: "2025-12-01", places: ["Atlanta, GA", "New York, NY"] },
        { date: "2025-11-01", places: ["Delhi, India", "Amritsar, India", "Uttar Pradesh, India", "Madhya Pradesh, India", "Rishikesh, India"] },
        { date: "2025-09-01", places: ["Iceland"] },
        { date: "2025-08-01", places: ["Miami, FL"] },
        { date: "2025-07-01", places: ["Olympic National Park, WA"] },
        { date: "2025-05-01", places: ["Arizona", "Atlanta, GA", "Orlando, FL"] },
        { date: "2025-04-01", places: ["San Diego, CA"] },
        { date: "2025-01-01", places: ["Boston, MA"] },
        { date: "2024-12-01", places: ["Nashville, TN"] },
        { date: "2024-10-01", places: ["New York, NY"] },
        { date: "2024-09-01", places: ["Miami, FL"] },
        { date: "2024-07-01", places: ["Banff, Canada"] },
        { date: "2024-06-01", places: ["Osaka, Japan", "Kyoto, Japan", "Hiroshima, Japan", "Tokyo, Japan", "Mount Fuji, Japan"] },
        { date: "2024-03-01", places: ["Las Vegas, NV"] },
        { date: "2024-01-01", places: ["Sugar Mountain, NC"] },
        { date: "2023-12-01", places: ["Birmingham, AL"] },
        { date: "2023-11-01", places: ["Jamaica"] },
        { date: "2023-06-01", places: ["Miami, FL"] },
        { date: "2023-04-01", places: ["Puerto Rico"] }
      ],
      updates: [
        { date: "2026-04-15", title: "New York City", places: ["New York, NY"], text: "In NYC for my birthday!! Got to spend it at a big dinner with people from different eras of my life. Feeling so blessed to have a life full of such wonderful people. Some of them also made me this fantastic coconut cake. Isn't it beautiful?",
          media: [
            { src: "media/travel/nyc-birthday-dinner.jpg", alt: "Birthday dinner at an Italian restaurant: a plate of tiramisu and pastries with a big sparkler, held up with a huge smile" },
            { src: "media/travel/nyc-coconut-cake.jpg", alt: "A homemade coconut cake with white frosting, shredded coconut, blueberries and gold candles" }
          ] },
        { date: "2026-03-15", title: "Chicago", places: ["Chicago, IL"], text: "Went to Chicago for St. Patrick's. Saw lots of my friends from high school, college and post-grad life. Also visited Rush Med School because my friend got in and is considering going!! I also successfully thrifted for the first time in Chi.",
          media: [
            { src: "media/travel/chicago-bean.jpg", alt: "Crowds around the Bean in Millennium Park under a bright blue sky, with downtown towers behind it" },
            { src: "media/travel/chicago-rush.jpg", alt: "The Rush hospital tower on a sunny day, seen from the corner of Paulina Street" },
            { src: "media/travel/chicago-thrift-jersey.jpg", alt: "A thrifted black, white and red Chicago Bulls Nike shirt on a hanger" },
            { src: "media/travel/chicago-skyline.jpg", alt: "View from high above downtown Chicago looking north, with the river dyed green below and Lake Michigan on the right" }
          ] },
        { date: "2026-02-28", title: "Atlanta", places: ["Atlanta, GA"], text: "Went to ATL to visit family.",
          media: [
            { src: "media/travel/atlanta-cafe.jpg", alt: "A café table with a latte topped with rose petals, a berry tart, a sesame bagel with cream cheese and a slice of pistachio roll cake" }
          ] },
        { date: "2026-02-15", title: "San Francisco & Napa", places: ["San Francisco, CA", "Napa, CA"], text: "Went to SF and saw Napa. Highlights: wine tasting with friends, trying Shizen (a 100% vegetarian restaurant), the best pastries in the US at Butter & Crumble, and riding in a Waymo for the first time.",
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
