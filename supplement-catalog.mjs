// Supplement music.json with missing categories:
// - 60-90 BPM instrumental (vocal=none): lo-fi / ambient / classical / new-age / chillhop
// - high vocal tracks for running/fitness
// - relaxed / lazy mood tags on existing chill tracks
import { readFileSync, writeFileSync } from "fs";

const path = new URL("./data/music.json", import.meta.url);
const songs = JSON.parse(readFileSync(path, "utf-8"));

// Find max id number
const maxNum = Math.max(...songs.map((s) => parseInt(s.id.replace("s", "")) || 0));
let nextId = maxNum + 1;

function mk(title, artist, album, bpm, vocal, instrumental, styles, moods, duration, lossless) {
  return {
    id: `s${String(nextId++).padStart(3, "0")}`,
    title, artist, album, duration, bpm,
    vocal_level: vocal,
    is_instrumental: instrumental,
    style: styles,
    mood: moods,
    has_copyright: true,
    is_lossless: lossless,
  };
}

// ============================================================
// 40 tracks: 60-90 BPM instrumental (vocal=none)
// Styles: ambient, classical, new-age, lo-fi, chillhop, cinematic
// ============================================================
const instrumentals = [
  // --- Neo-classical / piano (60-75 BPM) ---
  ["Says","Nils Frahm","Felt",68,"none",true,["classical","ambient"],["calm","relaxed"],330,true],
  ["Near Light","Olafur Arnalds","...And They Have Escaped the Weight of Darkness",65,"none",true,["classical","ambient"],["calm","healing"],190,true],
  ["On the Nature of Daylight","Max Richter","The Blue Notebooks",70,"none",true,["classical","cinematic"],["melancholy","calm"],360,true],
  ["Nuvole Bianche","Ludovico Einaudi","Una Mattina",72,"none",true,["classical","new-age"],["calm","warm"],360,true],
  ["Experience","Ludovico Einaudi","In a Time Lapse",70,"none",true,["classical","cinematic"],["motivational","calm"],310,true],
  ["A Minor Beginning","Hania Rani","Esja",66,"none",true,["classical","ambient"],["calm","melancholy"],280,true],
  ["Le Onde","Ludovico Einaudi","Le Onde",75,"none",true,["classical","new-age"],["calm","relaxed"],300,true],
  ["The Departure","Max Richter","The Leftovers OST",68,"none",true,["classical","cinematic"],["melancholy","calm"],240,true],
  ["All Melody","Nils Frahm","All Melody",72,"none",true,["ambient","electronic"],["calm","focused"],420,true],
  ["Halls of the Summer","Nils Frahm","Wintermusik",65,"none",true,["classical","ambient"],["calm","warm"],280,false],

  // --- Ambient / electronic (60-80 BPM) ---
  ["An Ending (Ascent)","Brian Eno","Apollo: Atmospheres and Soundtracks",68,"none",true,["ambient","new-age"],["calm","healing"],260,true],
  ["Music for Airports 1/1","Brian Eno","Ambient 1: Music for Airports",60,"none",true,["ambient"],["calm","focused"],2900,true],
  ["A Walk","Tycho","Dive",75,"none",true,["ambient","electronic"],["chill","warm"],300,true],
  ["Hours","Tycho","Past Is Prologue",70,"none",true,["ambient","electronic"],["chill","relaxed"],280,false],
  ["Kiara","Bonobo","Black Sands",72,"none",true,["ambient","electronic"],["chill","warm"],320,true],
  ["Kong","Bonobo","Black Sands",78,"none",true,["ambient","electronic"],["chill","groovy"],290,false],
  ["Roygbiv","Boards of Canada","Music Has the Right to Children",75,"none",true,["ambient","electronic"],["chill","nostalgic"],150,true],
  ["Dayvan Cowboy","Boards of Canada","The Campfire Headphase",70,"none",true,["ambient","electronic"],["chill","nostalgic"],300,false],
  ["Xtal","Aphex Twin","Selected Ambient Works 85-92",72,"none",true,["ambient","electronic"],["calm","chill"],290,true],
  ["Lichen","Stars of the Lid","And Their Refinement of the Decline",60,"none",true,["ambient"],["calm","relaxed"],480,false],
  ["Requiem for the Static King Part One","A Winged Victory for the Sullen","A Winged Victory for the Sullen",65,"none",true,["ambient","classical"],["melancholy","calm"],540,true],
  ["Music for Nitrous Oxide","Stars of the Lid","Music for Nitrous Oxide",62,"none",true,["ambient"],["calm","relaxed"],600,false],
  ["Luminous","Jon Hopkins","Immunity",70,"none",true,["ambient","electronic"],["calm","focused"],360,true],
  ["Open Eye Signal","Jon Hopkins","Immunity",75,"none",true,["electronic","ambient"],["energetic","chill"],480,false],

  // --- Lo-fi / chillhop (70-90 BPM) ---
  ["Coffee","Beats Antique","Contraption Vol. 1",78,"none",true,["lo-fi","chillhop"],["chill","lazy"],240,false],
  ["Rainy Day","Nujabes","Modal Soul",82,"none",true,["lo-fi","jazz"],["chill","relaxed"],260,true],
  ["Feather","Nujabes","Modal Soul",80,"none",true,["lo-fi","jazz"],["chill","warm"],250,true],
  ["Luv(sic) Part 3","Nujabes","Luv(sic) Hexalogy",85,"none",true,["lo-fi","hiphop"],["chill","nostalgic"],280,true],
  ["Reflections","J Dilla","Donuts",78,"none",true,["lo-fi","hiphop"],["chill","warm"],120,true],
  ["Time: The Donut of the Heart","J Dilla","Donuts",82,"none",true,["lo-fi","hiphop"],["chill","nostalgic"],130,false],
  ["Fly Me to the Moon","J Dilla","Donuts",88,"none",true,["lo-fi","hiphop"],["chill","warm"],100,true],
  ["The Number Song","DJ Shadow","Endtroducing.....",85,"none",true,["lo-fi","hiphop"],["chill","energetic"],240,true],
  ["Organ Donor","DJ Shadow","Endtroducing.....",80,"none",true,["lo-fi","hiphop"],["chill","groovy"],180,false],
  ["Midnight City","M83","Hurry Up, We're Dreaming",88,"none",true,["electronic","ambient"],["energetic","nostalgic"],244,true],
  ["Outro","M83","Hurry Up, We're Dreaming",85,"none",true,["electronic","cinematic"],["energetic","epic"],341,false],

  // --- Japanese ambient / film score (60-80 BPM) ---
  ["Merry Christmas Mr. Lawrence","Ryuichi Sakamoto","Merry Christmas Mr. Lawrence OST",70,"none",true,["classical","ambient"],["melancholy","calm"],280,true],
  ["Aqua","Ryuichi Sakamoto","BTTB",68,"none",true,["classical","ambient"],["calm","healing"],300,true],
  ["One Summer's Day","Joe Hisaishi","Spirited Away OST",72,"none",true,["classical","new-age"],["warm","nostalgic"],190,true],
  ["The Wind Forest","Joe Hisaishi","My Neighbor Totoro OST",75,"none",true,["classical","new-age"],["warm","happy"],260,false],
  ["River Flows in You","Yiruma","First Love",72,"none",true,["classical","new-age"],["romantic","calm"],190,true],
  ["Kiss the Rain","Yiruma","From the Yellow Room",70,"none",true,["classical","new-age"],["melancholy","calm"],250,false],
];

// ============================================================
// 12 tracks: high vocal (for running/fitness/dance)
// ============================================================
const highVocals = [
  ["Rolling in the Deep","Adele","21",105,"high",false,["pop-vocal"],["energetic","motivational"],228,true],
  ["Someone Like You","Adele","21",75,"high",false,["pop-vocal"],["melancholy","sad"],285,false],
  ["Hello","Adele","25",78,"high",false,["pop-vocal"],["melancholy","nostalgic"],295,true],
  ["I Will Always Love You","Whitney Houston","The Bodyguard OST",88,"high",false,["pop-vocal"],["romantic","warm"],270,true],
  ["Hallelujah","Jeff Buckley","Grace",65,"high",false,["folk","indie"],["melancholy","calm"],400,false],
  ["Bohemian Rhapsody","Queen","A Night at the Opera",144,"high",false,["rock","cinematic"],["energetic","dramatic"],354,true],
  ["Don't Stop Me Now","Queen","Jazz",156,"high",false,["rock","pop-vocal"],["energetic","happy"],210,false],
  ["I Want It That Way","Backstreet Boys","Millennium",100,"high",false,["pop-vocal"],["romantic","nostalgic"],215,true],
  ["Everybody","Backstreet Boys","Backstreet's Back",110,"high",false,["pop-vocal","dance"],["energetic","happy"],230,false],
  ["Wrecking Ball","Miley Cyrus","Bangerz",120,"high",false,["pop-vocal"],["melancholy","energetic"],220,true],
  ["Chandelier","Sia","1000 Forms of Fear",120,"high",false,["pop-vocal","electronic"],["energetic","intense"],225,false],
  ["Alive","Sia","This Is Acting",126,"high",false,["pop-vocal","electronic"],["energetic","motivational"],240,true],
];

// Add instrumentals
for (const t of instrumentals) songs.push(mk(...t));
// Add high vocals
for (const t of highVocals) songs.push(mk(...t));

// ============================================================
// Add relaxed/lazy mood tags to existing chill tracks
// (only if they don't already have these tags)
// ============================================================
let relaxedAdded = 0;
let lazyAdded = 0;
for (const s of songs) {
  const hasChill = s.mood.includes("chill") || s.mood.includes("warm");
  const isSlow = s.bpm >= 60 && s.bpm <= 95;
  const hasRelaxed = s.mood.includes("relaxed");
  const hasLazy = s.mood.includes("lazy");

  if (hasChill && isSlow && !hasRelaxed && relaxedAdded < 25) {
    s.mood.push("relaxed");
    relaxedAdded++;
  }
  if (s.mood.includes("chill") && s.bpm >= 60 && s.bpm <= 85 && !hasLazy && lazyAdded < 15) {
    if (s.style.includes("lo-fi") || s.style.includes("jazz") || s.style.includes("bossa") || s.style.includes("ambient")) {
      s.mood.push("lazy");
      lazyAdded++;
    }
  }
}

writeFileSync(path, JSON.stringify(songs, null, 2), "utf-8");
console.log(`Done! Total: ${songs.length} songs`);
console.log(`Added relaxed tags: ${relaxedAdded}, lazy tags: ${lazyAdded}`);
