import { useEffect } from "react";
import { startReader } from "../engine/reader";
import type { ReaderData } from "../engine/types";
import { iconMap, iconBookmark, iconClose } from "../art/icons";

const Icon = ({ svg }: { svg: string }) => <span className="icw" dangerouslySetInnerHTML={{ __html: svg }} />;

/* The reader island: renders the fixed shell (top bar, maps, overlays, gate) and hands the
   story data to the engine, which paints scenes into #app. Faithful port of prototype v6. */
export default function Reader({ data }: { data: ReaderData }) {
  useEffect(() => {
    startReader(data);
  }, []);

  return (
    <>
      <header className="topbar">
        <button className="brand" id="brand" title="Back to the title page"><span className="dev" lang="sa">महाभारत</span><small id="themeName"></small></button>
        <div className="spacer"></div>
        <button className="tbtn" id="bmBtn" title="Bookmark this moment" style={{ display: "none" }}>
          <Icon svg={iconBookmark} />
          <span className="lbl">Bookmark</span>
        </button>
        <button className="tbtn" id="mapBtn" title="Open the maps">
          <Icon svg={iconMap} />
          <span className="lbl">Maps</span>
        </button>
      </header>

      <main id="app"></main>
      <nav id="crumbs" aria-label="Return path"></nav>

      <div id="maps" role="dialog" aria-modal="true" aria-label="Maps">
        <div className="mtop">
          <div className="mtabs" id="mtabs" role="tablist" aria-label="Maps">
            <button className="mtab on" data-t="kala" role="tab" aria-selected="true" aria-controls="kala"><span className="dev" lang="sa">काल</span><span className="en">KĀLA · TIME</span></button>
            <button className="mtab" data-t="desha" role="tab" aria-selected="false" aria-controls="desha" tabIndex={-1}><span className="dev" lang="sa">देश</span><span className="en">DEŚA · LAND</span></button>
            <button className="mtab" data-t="patra" role="tab" aria-selected="false" aria-controls="patra" tabIndex={-1}><span className="dev" lang="sa">पात्र</span><span className="en">PĀTRA · SOULS</span></button>
            <button className="mtab" data-t="marga" role="tab" aria-selected="false" aria-controls="marga" tabIndex={-1}><span className="dev" lang="sa">मार्ग</span><span className="en">MĀRGA · PATH</span></button>
            <button className="mtab" data-t="smriti" role="tab" aria-selected="false" aria-controls="smriti" tabIndex={-1}><span className="dev" lang="sa">स्मृति</span><span className="en">SMṚTI · MARKS</span></button>
          </div>
          <button className="mclose" id="mapClose" aria-label="Close maps"><Icon svg={iconClose} /></button>
        </div>
        <div className="mbody">
          <div className="mview" id="kala" role="tabpanel" aria-label="Kāla, time"><div id="kalaLabels" aria-hidden="true"></div><div id="kalaScroll" tabIndex={0} role="group" aria-label="Kāla chart: scroll sideways through time"></div><div id="kalaText" className="sr-only"></div><div id="kalaLegend" aria-hidden="true"></div></div>
          <div className="mview" id="desha" role="tabpanel" aria-label="Deśa, land" tabIndex={0}><div id="deshaMap"></div><div id="deshaText" className="sr-only"></div></div>
          <div className="mview" id="patra" role="tabpanel" aria-label="Pātra, souls"></div>
          <div className="mview" id="marga" role="tabpanel" aria-label="Mārga, your path"></div>
          <div className="mview" id="smriti" role="tabpanel" aria-label="Smṛti, bookmarks"></div>
          <div className="info" id="info" role="region" aria-label="Details" aria-live="polite"></div>
        </div>
      </div>

      <div id="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <div className="box">
          <h4 id="mTitle"></h4><p id="mSub"></p>
          <textarea id="mText" placeholder="A note to your future self…" aria-label="Your note"></textarea>
          <div className="row"><button className="kbtn" id="mCancel">Skip</button><button className="kbtn primary" id="mOk">Save</button></div>
        </div>
      </div>
      <div id="toast" role="status" aria-live="polite"></div>
      <div id="soul" role="dialog" aria-modal="true"></div>
      <div id="gate" role="dialog" aria-modal="true" aria-labelledby="gateT">
        <div className="gbox"><div className="gin">
          <div className="dev" lang="sa" style={{ fontSize: 30, color: "var(--accent)" }}>महाभारत</div>
          <h2 id="gateT">Before you enter</h2>
          <p>This is the Mahābhārata as the epic tells it, for readers <b>21 and over</b>. Its scenes include war and killing, blood, the assault and humiliation of a woman, curses, grief and death, shown plainly as part of the story.</p>
          <p className="hand" style={{ color: "var(--muted)" }}>This notice appears once.</p>
          <div className="row"><button className="kbtn" id="gateNo">Not now</button><button className="kbtn primary" id="gateYes">I am 21+ — enter the epic</button></div>
        </div></div>
      </div>
      <div id="drawer" role="dialog" aria-modal="true" aria-label="Sources and tellings"></div>
    </>
  );
}
