import type { ComponentType } from "react";
import type { GameProps } from "@/components/game/kit";
import { BlokOkuma, GolgeOkuma, OkumaTesti, RehberliOkuma } from "./reading";
import { GenisleyenCerceve, GozTakibi, KelebekSayaci, SicrayanTavsan } from "./eye";
import { AyniMi, Schulte, SimsekKelime } from "./perception";
import { DurGec, FarkliOlan, KelimeAvi, OkYagmuru, RenkTuzagi, TepkiAvcisi } from "./attention";
import { DonenKare, HafizaTreni, IsikYolu, KelimeHafizasi, SayiHafizasi } from "./memory";
import { HangisiBuyuk, RoketSiralama, SayiZinciri, ZihindenHesap } from "./math";
import { CumleDogrulama, KelimeUstasi, LabirentOkuma } from "./language";
import { BilgiAvi, HafizaKartlari, IsaretlemeTesti } from "./extra";

export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  "sicrayan-tavsan": SicrayanTavsan,
  "kelebek-sayaci": KelebekSayaci,
  "goz-takibi": GozTakibi,
  "genisleyen-cerceve": GenisleyenCerceve,
  "simsek-kelime": SimsekKelime,
  schulte: Schulte,
  "ayni-mi": AyniMi,
  "kelime-avi": KelimeAvi,
  "dur-gec": DurGec,
  "ok-yagmuru": OkYagmuru,
  "renk-tuzagi": RenkTuzagi,
  "farkli-olan": FarkliOlan,
  "tepki-avcisi": TepkiAvcisi,
  "donen-kare": DonenKare,
  "isik-yolu": IsikYolu,
  "sayi-hafizasi": SayiHafizasi,
  "hafiza-treni": HafizaTreni,
  "kelime-hafizasi": KelimeHafizasi,
  "roket-siralama": RoketSiralama,
  "zihinden-hesap": ZihindenHesap,
  "sayi-zinciri": SayiZinciri,
  "hangisi-buyuk": HangisiBuyuk,
  "rehberli-okuma": RehberliOkuma,
  "blok-okuma": BlokOkuma,
  "golge-okuma": GolgeOkuma,
  "okuma-testi": OkumaTesti,
  "cumle-dogrulama": CumleDogrulama,
  "labirent-okuma": LabirentOkuma,
  "kelime-ustasi": KelimeUstasi,
  "bilgi-avi": BilgiAvi,
  "hafiza-kartlari": HafizaKartlari,
  isaretleme: IsaretlemeTesti,
};
