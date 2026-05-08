"use client";
import { Nav } from "@/components/wedding/Nav";
import {
  useGallery,
  useSchedule,
  useTimeline,
  useWeddingSettings,
} from "@/hooks/useWeddingData";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import dynamic from "next/dynamic";
import { Hero } from "@/components/wedding/Hero";
import { Petals } from "@/components/Petals";
import { Message } from "@/components/wedding/Message";
import { Countdown } from "@/components/wedding/Countdown";
import { Details } from "@/components/wedding/Details";
const Schedule = dynamic(
  () => import("../components/wedding/Schedule").then(m => ({ default: m.Schedule })),
  { ssr: false }
);
import { Gallery } from "@/components/wedding/Gallery";
import { RSVP } from "@/components/wedding/RSVP";
import { Footer } from "@/components/wedding/Footer";


const Home = ({ previewData }: { previewData?: any }) => {
  const { data: dbSettings, isLoading } = useWeddingSettings();
  const { data: timeline = [] } = useTimeline();
  const { data: gallery = [] } = useGallery();
  const { data: scheduleEvents = [] } = useSchedule();
  const settings = previewData || dbSettings;
  const [showSuspense, setShowSuspense] = useState(true);

  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursorRing");

    if (!cursor || !ring) return;

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;

      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.tagName === "SELECT" ||
        target.closest("button") !== null ||
        target.closest("a") !== null;

      if (isInteractive) {
        cursor.style.opacity = "0";
        ring.style.opacity = "0";
      } else {
        cursor.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    document.addEventListener("mousemove", onMouseMove);

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      }
      animationFrameId = requestAnimationFrame(animateRing);
    }
    animateRing();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoading, settings, showSuspense]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuspense(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSuspense || !settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream transition-opacity duration-1000">
        <div className="relative flex items-center justify-center mb-8 h-24 w-24">
          <div
            className="absolute inset-0 m-auto w-16 h-16 border-[1px] border-gold rounded-full animate-spin border-t-transparent"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute inset-0 m-auto w-20 h-20 border-[1px] border-gold/40 rounded-full animate-spin border-b-transparent"
            style={{ animationDuration: "4s", animationDirection: "reverse" }}
          />
          <Heart
            className="text-gold w-7 h-7 animate-pulse"
            strokeWidth={1.75}
          />
        </div>
        <p className="font-display italic text-2xl text-warm-soft tracking-widest animate-pulse">
          Forever is about to Begin…
        </p>
      </div>
    );
  }

  const date = new Date(settings.wedding_date);
  const initials = `${settings.groom_name[0]} & ${settings.bride_name[0]}`;
  const year = date.getFullYear().toString();
  const title = `${settings.groom_name} & ${settings.bride_name} — ${date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  )}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content={`Join ${settings.bride_name} and ${settings.groom_name} as they say I do. ${settings.tagline}`}
        />
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

      <Nav
        initials={initials}
        year={year}
        labels={{
          countdown: settings.nav_countdown_label,
          story: settings.nav_story_label,
          schedule: settings.nav_schedule_label,
          gallery: settings.nav_gallery_label,
          rsvp: settings.nav_rsvp_label,
        }}
      />
      <main>
        {/* Custom Cursor */}
        <div
          className="w-2 h-2 bg-gold rounded-full fixed top-0 left-0 z-50 pointer-events-none hidden md:block transition-opacity duration-200"
          id="cursor"
        ></div>
        <div
          className="w-8 h-8 border-2 border-gold rounded-full fixed top-0 left-0 z-50 pointer-events-none hidden md:block transition-opacity duration-200"
          id="cursorRing"
        ></div>

        <Hero
          bride={settings.bride_name}
          groom={settings.groom_name}
          date={date}
          eyebrow={settings.hero_eyebrow}
          imageUrl={settings.hero_public_url}
          imageUrl2={settings.hero_2_public_url}
          imagePath={settings.hero_image_path}
          imagePath2={settings.hero_image_2_path}
          inviteText={settings.hero_invite_text}
        />
        <Petals />

        <Message
          verseText={settings.story_verse_text}
          verseRef={settings.story_verse_reference}
          greeting={settings.story_greeting}
          intro={settings.story_intro}
          quote2={settings.story_quote_2}
          quote2Ref={settings.story_quote_2_reference}
        />

        <Countdown
          dbDate={date}
          eyebrow={settings.countdown_eyebrow}
          title={settings.countdown_title}
        />
        <Details
          ceremony={{
            title: settings.ceremony_title,
            time: settings.ceremony_time,
            venue: settings.ceremony_venue,
            address: settings.ceremony_address,
          }}
          reception={{
            title: settings.reception_title,
            time: settings.reception_time,
            venue: settings.reception_venue,
            address: settings.reception_address,
          }}
          eyebrow={settings.details_eyebrow}
          title={settings.details_title}
        />

        <Schedule events={scheduleEvents} />

        <Gallery images={gallery} />

        <RSVP
          message={settings.rsvp_message}
          eyebrow={settings.rsvp_eyebrow}
          title={settings.rsvp_title}
          successMessage={settings.rsvp_success_message}
          optionYes={settings.rsvp_option_yes}
          optionNo={settings.rsvp_option_no}
        />
      </main>
      <Footer 
        bride={settings.bride_name} 
        groom={settings.groom_name} 
        date={date} 
        instagramUrl={settings.instagram_url}
        contactEmail={settings.contact_email}
        madeWith={settings.footer_made_with}
      />
    </>
  );
};

export default Home;
