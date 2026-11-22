import { useEffect } from "react";
import { startReader } from "../engine/reader";

export interface ReaderData {
  places: unknown[];
  people: unknown[];
  moments: unknown[];
  tiers: string[];
}

/* The reader island: renders the fixed shell (top bar, maps, overlays, gate) and hands the
   story data to the engine, which paints scenes into #app. Faithful port of prototype v6. */
export default function Reader({ data }: { data: ReaderData }) {
  useEffect(() => {
    startReader(data);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="brand" id="brand"><span className="dev">महाभारत</span><small id="themeName"></small></div>
        <div className="spacer"></div>
        <button className="tbtn" id="bmBtn" title="Bookmark this moment" style={{ display: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
          <span className="lbl">Bookmark</span>
        </button>
        <button className="tbtn" id="mapBtn" title="Open the maps">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15" /></svg>
          <span className="lbl">Maps</span>
        </button>
      </div>

      <main id="app"></main>
      <nav id="crumbs" aria-label="Return path"></nav>

      <div id="maps">
        <div className="mtop">
          <div className="mtabs" id="mtabs">
            <button className="mtab on" data-t="kala"><span className="dev">काल</span><span className="en">KĀLA · TIME</span></button>
            <button className="mtab" data-t="desha"><span className="dev">देश</span><span className="en">DEŚA · LAND</span></button>
            <button className="mtab" data-t="patra"><span className="dev">पात्र</span><span className="en">PĀTRA · SOULS</span></button>
            <button className="mtab" data-t="marga"><span className="dev">मार्ग</span><span className="en">MĀRGA · PATH</span></button>
            <button className="mtab" data-t="smriti"><span className="dev">स्मृति</span><span className="en">SMṚTI · MARKS</span></button>
          </div>
          <button className="mclose" id="mapClose" aria-label="Close maps">×</button>
        </div>
        <div className="mbody">
          <div className="mview" id="kala"><div id="kalaLabels"></div><div id="kalaScroll"></div></div>
          <div className="mview" id="desha"></div>
          <div className="mview" id="patra"></div>
          <div className="mview" id="marga"></div>
          <div className="mview" id="smriti"></div>
          <div className="info" id="info"></div>
        </div>
      </div>

      <div id="modal">
        <div className="box">
          <h4 id="mTitle"></h4><p id="mSub"></p>
          <textarea id="mText" placeholder="A note to your future self…"></textarea>
          <div className="row"><button className="kbtn" id="mCancel">Skip</button><button className="kbtn primary" id="mOk">Save</button></div>
        </div>
      </div>
      <div id="toast"></div>
      <div id="soul"></div>
      <div id="gate" role="dialog" aria-modal="true" aria-labelledby="gateT">
        <div className="gbox"><div className="gin">
          <div className="dev" lang="sa" style={{ fontSize: 30, color: "var(--accent)" }}>महाभारत</div>
          <h3 id="gateT">Before you enter</h3>
          <p>This is the Mahābhārata as the epic tells it, for readers <b>21 and over</b>. Its scenes include war and killing, blood, the assault and humiliation of a woman, curses, grief and death, shown plainly as part of the story.</p>
          <p className="hand" style={{ color: "var(--muted)" }}>This notice appears once.</p>
          <div className="row"><button className="kbtn" id="gateNo">Not now</button><button className="kbtn primary" id="gateYes">I am 21+ — enter the epic</button></div>
        </div></div>
      </div>
      <aside id="drawer" aria-label="Sources and tellings"></aside>
    </>
  );
}
