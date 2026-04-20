"use client";

import { Button } from "@/components/ui/button";
import type { Kindergarten } from "@/lib/kindergartens";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const PARENT_NAMES = [
  "Ahmet",
  "Mehmet",
  "Mustafa",
  "Ali",
  "Hüseyin",
  "Hasan",
  "İbrahim",
  "Emre",
  "Can",
  "Burak",
  "Ayşe",
  "Fatma",
  "Zeynep",
  "Elif",
  "Merve",
  "Selin",
  "Deniz",
  "Ece",
  "Defne",
  "Ela",
];
const SURNAMES = [
  "Yılmaz",
  "Kaya",
  "Demir",
  "Çelik",
  "Şahin",
  "Öztürk",
  "Aydın",
  "Özdemir",
  "Arslan",
  "Doğan",
  "Koç",
  "Yıldız",
  "Kılıç",
  "Aslan",
  "Çetin",
  "Polat",
  "Özkan",
  "Korkmaz",
  "Şimşek",
  "Güneş",
];
const DISTRICTS = ["Atakum"];
const NEIGHBORHOODS: Record<string, string[]> = {
  Atakum: [
    "Atakent",
    "Kurupelit",
    "Çatalçam",
    "Denizevleri",
    "Yeşilyurt",
    "İncesu",
    "Kurupelit Yalı",
    "Atakent Sahil",
    "Çobanlı",
    "Taflan",
    "Büyükoyumca",
    "Küçükoyumca",
    "Meşelidüz",
    "Akalan",
    "Güzelyurt",
    "Kazımkarabekir",
    "Kurtuluş",
    "Mimar Sinan",
    "Yenimahalle",
    "Yeşiltepe",
  ],
};
const SOCIAL_SECURITY = ["bagkur", "ssk", "emekli_sandigi"];
const CHILD_NAMES = [
  "Ege",
  "Arda",
  "Alp",
  "Efe",
  "Kaan",
  "Berk",
  "Can",
  "Deniz",
  "Emir",
  "Kerem",
  "Elif",
  "Ece",
  "Defne",
  "Selin",
  "Ada",
  "Zeynep",
  "Nehir",
  "Su",
  "Ela",
  "Derin",
];
const YES_NO = ["evet", "hayir"];
const HOUSE_OWNERSHIP = ["kendi", "kira"];
const HEATING = ["dogalgaz", "komur"];
const SOCIAL_AID_SOURCES = ["Belediye", "Kaymakamlık", "Bakanlık", "Kızılay"];
const OTHER_INCOME_SOURCES = [
  "Kira geliri",
  "Ticaret",
  "Tarım",
  "Başka iş",
  "Yardım",
];
const CHRONIC_DISEASE_NOTES = ["kronik_hastalik", "kronik_hastalik_aciklama"];

interface FakeFormFillerProps {
  currentStep: number;
  kindergartens: Kindergarten[];
  setFormData: Dispatch<SetStateAction<any>>;
  setBirthDate: (date: Date) => void;
  setChildBirthDate: (date: Date) => void;
}

/** Çocuk Gelişim Merkezi listesinden sırayla 1–2–3–4 tercih için ID döndürür (en fazla 4 farklı). */
function pickKresIdsInOrder(
  kindergartens: Kindergarten[],
  count: number,
): string[] {
  if (kindergartens.length === 0) return [];
  const ids = kindergartens.map((k) => k.id.toString());
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function FakeFormFiller({
  currentStep,
  kindergartens,
  setFormData,
  setBirthDate,
  setChildBirthDate,
}: FakeFormFillerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const randomTc = () => {
    const digits: number[] = [];
    digits[0] = Math.floor(1 + Math.random() * 9);
    for (let i = 1; i < 9; i++) digits[i] = Math.floor(Math.random() * 10);
    const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
    digits[9] = (((sum1 * 7 - sum2) % 10) + 10) % 10;
    digits[10] = (sum1 + sum2 + digits[9]) % 10;
    return digits.join("");
  };

  const randomPhone = () =>
    "05" + Math.floor(500000000 + Math.random() * 500000000).toString();

  const randomDate = (yearFrom: number, yearTo: number) => {
    const y = yearFrom + Math.floor(Math.random() * (yearTo - yearFrom + 1));
    const m = Math.floor(Math.random() * 12);
    const d = 1 + Math.floor(Math.random() * 28);
    const date = new Date(y, m, d);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return { date, str: `${day}.${month}.${y}` };
  };

  const randomChildBirthDateForKres = () => {
    const refYear = new Date().getFullYear();
    // O yılın 1 Eylülünde 3–6 yaş: doğum 2 Eylül (refYear-7) ile 1 Eylül (refYear-3) arası
    const from = new Date(refYear - 7, 8, 2);
    const to = new Date(refYear - 3, 8, 1);
    const ts =
      from.getTime() +
      Math.floor(Math.random() * (to.getTime() - from.getTime() + 1));
    const date = new Date(ts);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return { date, str: `${day}.${month}.${y}` };
  };

  const toAscii = (s: string) =>
    s
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");

  const fillStep1 = () => {
    const parentName = pick(PARENT_NAMES);
    const parentSurname = pick(SURNAMES);
    const district = pick(DISTRICTS);
    const neighborhood = pick(NEIGHBORHOODS[district] || [district]); // adres metni için
    const parentBirth = randomDate(1960, 1995);
    const childBirth = randomChildBirthDateForKres();
    const emailUser = `${toAscii(parentName)}.${toAscii(parentSurname)}`;
    const streetNo = 1 + Math.floor(Math.random() * 150);
    const aptNo = 1 + Math.floor(Math.random() * 20);

    const step1Data = {
      parentName,
      parentSurname,
      parentTc: randomTc(),
      parentBirthDate: parentBirth.str,
      parentPhone: randomPhone(),
      parentEmail: `${emailUser}@example.com`,
      parentAddress: `${neighborhood} Mah. Örnek Cad. No:${streetNo}`,
      parentDistrict: district,
      parentSecondaryAddress: `${neighborhood} Mah. Örnek Cad. No:${streetNo} Daire ${aptNo}`,
      parentSocialSecurity: pick(SOCIAL_SECURITY),
      ...((): Record<string, string> => {
        const [first, second, third, fourth] = pickKresIdsInOrder(
          kindergartens,
          4,
        );
        return {
          firstChoiceKresId: first ?? "",
          secondChoiceKresId: second ?? "",
          thirdChoiceKresId: third ?? "",
          fourthChoiceKresId: fourth ?? "",
        };
      })(),
      childTcno: randomTc(),
      childBirthDate: childBirth.str,
      childFirstName: pick(CHILD_NAMES),
      childLastName: parentSurname,
      childGender: pick(["erkek", "kız"]),
      childToiletTrained: pick(YES_NO),
      hasChronicDisease: pick(YES_NO),
      chronicDiseaseNote: pick(CHRONIC_DISEASE_NOTES),
      isMunicipalityEmployee: pick(YES_NO),
    };

    setFormData((prev: any) => ({ ...prev, ...step1Data }));
    setBirthDate(parentBirth.date);
    setChildBirthDate(childBirth.date);
  };

  const fillStep2 = () => {
    const familyCount = 2 + Math.floor(Math.random() * 5);
    const studentCount = Math.min(
      Math.floor(Math.random() * (familyCount + 1)),
      familyCount,
    );
    const workingCount = Math.min(
      Math.floor(Math.random() * (familyCount + 1)),
      familyCount,
    );
    const houseOwnership = pick(HOUSE_OWNERSHIP);
    const hasOtherIncome = pick(YES_NO);

    const step2Data = {
      familyMemberCount: String(familyCount),
      studentCount: String(studentCount),
      areParentsSeparated: pick(YES_NO),
      hasDisabledPersonAtHome: pick(YES_NO),
      isMotherWorking: pick(YES_NO),
      isFatherWorking: pick(YES_NO),
      isMotherDisabled: pick(YES_NO),
      isFatherDisabled: pick(YES_NO),
      isMotherHealthy: pick(YES_NO),
      isFatherHealthy: pick(YES_NO),
      hasPensionMember: pick(YES_NO),
      houseOwnership,
      rentAmount:
        houseOwnership === "kira"
          ? String(2000 + Math.floor(Math.random() * 13000))
          : "",
      heatingType: pick(HEATING),
      workingMemberCount: String(workingCount),
      hasOtherIncome,
      otherIncomeSource:
        hasOtherIncome === "evet" ? pick(OTHER_INCOME_SOURCES) : "",
      totalIncomeRangeId: String(1 + Math.floor(Math.random() * 5)),
      explanation: pick([
        "Test başvurusu",
        "Dev verisi",
        "Otomatik doldurma",
        "",
      ]),
    };

    setFormData((prev: any) => ({ ...prev, ...step2Data }));
  };

  return (
    <div className="mt-6 flex justify-end">
      {currentStep === 1 && (
        <Button
          onClick={fillStep1}
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
        >
          DEV: Başvuru Bilgilerini Doldur
        </Button>
      )}
      {currentStep === 2 && (
        <Button
          onClick={fillStep2}
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
        >
          DEV: Aile &amp; Durum Bilgilerini Doldur
        </Button>
      )}
    </div>
  );
}
