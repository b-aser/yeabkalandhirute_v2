import {  Mail } from "lucide-react";
import { FaInstagram, FaMailBulk,  } from "react-icons/fa";
import {FiMail} from "react-icons/fi";

export const Footer = ({ 
  bride, 
  groom, 
  date,
  instagramUrl,
  contactEmail,
  madeWith
}: { 
  bride: string; 
  groom: string; 
  date: Date;
  instagramUrl?: string;
  contactEmail?: string;
  madeWith?: string;
}) => {
  return (
    <footer className=" bottom-0 left-0 right-0  sticky z-[-2] text-center py-20 font-normal">
      <p className="font-display italic font-light text-warm-dark"
         style={{ fontSize: "clamp(32px, 6vw, 64px)" }}>
        {groom} <span className="text-gold">&amp;</span> {bride}
      </p>
      <p className="text-[10px] tracking-[0.5em] uppercase text-warm-soft mt-5">
        {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>
      <div className="flex justify-center gap-6 my-6 ">
        <a
          href={instagramUrl || "https://www.instagram.com/yeab_kal/"}
          aria-label="Instagram"
          target="_blank"
          rel="noreferrer"
          className="h-12 w-12 rounded-full border-[1.5px] border-primary backdrop-blur flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 hover:scale-110"
        >
          <FaInstagram className="h-7 w-7" />
        </a>
        <a
          href={`mailto:${contactEmail || "alemu.aser.tesfaye@gmail.com"}`}
          aria-label="Email"
          className="h-12 w-12 rounded-full border-[1.5px] border-primary backdrop-blur flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 hover:scale-110"
        >
          <FiMail className="h-6 w-6" />
        </a>
      </div>
      <p className="text-[10px] tracking-[0.5em] uppercase text-warm-soft mt-5">
      Made with Love by <a href="https://www.instagram.com/aser._.tesfaye/" target="_blank" rel="noreferrer" className="text-warm-dark font-normal hover:underline ">B-aser</a> · {new Date().getFullYear()}
      </p>
    </footer>
  );
};
