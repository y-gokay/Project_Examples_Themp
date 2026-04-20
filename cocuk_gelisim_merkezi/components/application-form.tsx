"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Users,
  Home,
  Wallet,
  Info,
  CalendarIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { apiConfig, isKresMockMode } from "@/lib/api-config";
import { mockIncomeRanges } from "@/lib/kres-mock-data";
import { fetchKindergartens, type Kindergarten } from "@/lib/kindergartens";
import { getDetailedValidationMessage } from "@/lib/form-accessibility";
import dynamic from "next/dynamic";

// Sadece development'ta yükle; production bundle'dan çıkar
const FakeFormFiller =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("./fake-form-filler").then((mod) => ({
            default: mod.FakeFormFiller,
          })),
        { ssr: false },
      )
    : function Noop() {
        return null;
      };

const INITIAL_FORM_DATA = {
  // Veli Bilgileri
  parentName: "",
  parentSurname: "",
  parentTc: "",
  parentBirthDate: "",
  parentPhone: "",
  parentEmail: "",
  parentAddress: "",
  parentDistrict: "Atakum",
  parentSecondaryAddress: "",
  parentSocialSecurity: "",
  // Çocuk Gelişim Merkezi Tercihleri
  firstChoiceKresId: "",
  secondChoiceKresId: "",
  thirdChoiceKresId: "",
  fourthChoiceKresId: "",
  // Çocuk Bilgileri
  childTcno: "",
  childBirthDate: "",
  childFirstName: "",
  childLastName: "",
  childGender: "",
  childToiletTrained: "",
  // Belediye Personeli
  isMunicipalityEmployee: "",
  // Aile Bilgileri
  familyMemberCount: "",
  studentCount: "",
  areParentsSeparated: "",
  hasDisabledPersonAtHome: "",
  isMotherWorking: "",
  isFatherWorking: "",
  isMotherDisabled: "",
  isFatherDisabled: "",
  isMotherHealthy: "",
  isFatherHealthy: "",
  hasPensionMember: "",
  hasChronicDisease: "",
  chronicDiseaseNote: "",
  houseOwnership: "",
  rentAmount: "",
  heatingType: "",
  workingMemberCount: "",
  hasOtherIncome: "",
  otherIncomeSource: "",
  totalIncomeRangeId: "",
  explanation: "",
};

// Gelir aralığı tipi (GET /income-ranges)
export interface IncomeRange {
  id: number;
  minIncome: number;
  maxIncome: number;
  score: string;
  order: number;
}

// Form Steps
const STEPS = [
  { id: 1, title: "Başvuru Bilgileri", icon: User },
  { id: 2, title: "Aile & Durum", icon: Home },
];

const isDev = process.env.NODE_ENV === "development";

export function ApplicationForm() {
  const router = useRouter();
  const errorAlertRef = useRef<HTMLDivElement | null>(null);
  const submitIntentRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Form Data State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Date picker state
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [childBirthDate, setChildBirthDate] = useState<Date | undefined>(
    undefined,
  );

  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [loadingKindergartens, setLoadingKindergartens] = useState(true);
  const [incomeRanges, setIncomeRanges] = useState<IncomeRange[]>([]);
  const [loadingIncomeRanges, setLoadingIncomeRanges] = useState(true);

  // Hata oluştuğunda üstteki hata kartına odaklan ve oraya kaydır
  useEffect(() => {
    if (submitError && errorAlertRef.current) {
      errorAlertRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      errorAlertRef.current.focus();
    }
  }, [submitError]);

  useEffect(() => {
    loadKindergartens();
  }, []);

  useEffect(() => {
    const loadIncomeRanges = async () => {
      try {
        setLoadingIncomeRanges(true);
        if (isKresMockMode) {
          const items = mockIncomeRanges.items ?? [];
          setIncomeRanges(
            [...items].sort(
              (a: IncomeRange, b: IncomeRange) => a.order - b.order,
            ),
          );
          return;
        }
        const res = await fetch(apiConfig.endpoints.incomeRanges, {
          cache: "no-store",
        });
        const data = await res.json();
        const items = data?.items ?? data ?? [];
        setIncomeRanges(
          Array.isArray(items)
            ? items.sort((a: IncomeRange, b: IncomeRange) => a.order - b.order)
            : [],
        );
      } catch (err) {
        if (isDev) {
          console.error("[Gelir aralıkları]", "Yüklenemedi:", err);
        }
        setIncomeRanges([]);
      } finally {
        setLoadingIncomeRanges(false);
      }
    };
    loadIncomeRanges();
  }, []);

  // Initialize birthDate from formData on mount
  useEffect(() => {
    if (formData.parentBirthDate) {
      const parsed = parseDateFromString(formData.parentBirthDate);
      if (parsed) {
        setBirthDate(parsed);
      }
    }
    if (formData.childBirthDate) {
      const parsed = parseDateFromString(formData.childBirthDate);
      if (parsed) {
        setChildBirthDate(parsed);
      }
    }
  }, []);

  const loadKindergartens = async () => {
    try {
      setLoadingKindergartens(true);
      const data = await fetchKindergartens();
      setKindergartens(data);
    } catch (error) {
      if (isDev) {
        console.error("[Çocuk Gelişim Merkezleri]", "Yüklenemedi:", error);
      }
    } finally {
      setLoadingKindergartens(false);
    }
  };

  const districts = ["Atakum"];

  // Helper Functions
  const convertDateToApiFormat = (dateStr: string): string => {
    if (dateStr.length === 10 && /^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split(".");
      return `${year}-${month}-${day}`;
    }
    // Date objesi formatından API formatına çevir
    if (dateStr.includes("-")) {
      return dateStr;
    }
    return "";
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);
    if (limited.length <= 2) return limited;
    if (limited.length <= 4)
      return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    return `${limited.slice(0, 2)}.${limited.slice(2, 4)}.${limited.slice(4)}`;
  };

  // Date objesini DD.MM.YYYY formatına çevir
  const formatDateToDisplay = (date: Date | undefined): string => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // DD.MM.YYYY formatındaki string'i Date objesine çevir
  const parseDateFromString = (dateStr: string): Date | undefined => {
    if (dateStr.length === 10 && /^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split(".");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return undefined;
  };

  /** 1 Eylül itibarıyla çocuğun yaşını hesaplar (referans yıl = başvuru yılı / mevcut yıl). */
  const getChildAgeAsOfSeptember1 = (
    birthDate: Date,
    referenceYear?: number,
  ): number => {
    const refYear = referenceYear ?? new Date().getFullYear();
    const refDate = new Date(refYear, 8, 1); // 1 Eylül, ay 0-indexed
    let age = refDate.getFullYear() - birthDate.getFullYear();
    const m = refDate.getMonth() - birthDate.getMonth();
    const d = refDate.getDate() - birthDate.getDate();
    if (m < 0 || (m === 0 && d < 0)) age--;
    return age;
  };

  /** Çocuğun o yılın 1 Eylülünde 3–6 yaş aralığında olup olmadığını kontrol eder. */
  const validateChildAgeForKres = (birthOverride?: Date): string | null => {
    const birth =
      birthOverride ??
      childBirthDate ??
      parseDateFromString(formData.childBirthDate);
    if (!birth) return null;
    const age = getChildAgeAsOfSeptember1(birth);

    const minAllowedAge = 3;
    const maxAllowedAge = 6;

    if (age < minAllowedAge)
      return `Çocuğunuzun o yılın 1 Eylülündeki yaşı en az ${minAllowedAge} olmalıdır.`;
    if (age > maxAllowedAge)
      return `Çocuğunuzun o yılın 1 Eylülündeki yaşı en fazla ${maxAllowedAge} olmalıdır.`;
    return null;
  };

  // Field validation helper - using detailed messages
  const validateField = (field: string, value: string): string | null => {
    return getDetailedValidationMessage(field, value);
  };

  const handleChange = (field: string, value: string) => {
    // Field'ı touched olarak işaretle
    setTouchedFields((prev) => new Set(prev).add(field));

    // Field validation with detailed messages
    const error = validateField(field, value);
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    setFormData((prev) => {
      const updates: Record<string, string> = { [field]: value };

      // Bağımlı alanları temizleme mantığı
      if (field === "houseOwnership" && value !== "kira")
        updates.rentAmount = "";
      if (field === "hasOtherIncome" && value === "hayir")
        updates.otherIncomeSource = "";
      if (field === "hasChronicDisease" && value === "hayir")
        updates.chronicDiseaseNote = "";

      // Çocuk Gelişim Merkezi tercihleri sıralı: önceki tercih değişince sonrakileri temizle
      if (field === "firstChoiceKresId") {
        updates.secondChoiceKresId = "";
        updates.thirdChoiceKresId = "";
        updates.fourthChoiceKresId = "";
      }
      if (field === "secondChoiceKresId") {
        updates.thirdChoiceKresId = "";
        updates.fourthChoiceKresId = "";
      }
      if (field === "thirdChoiceKresId") updates.fourthChoiceKresId = "";

      return { ...prev, ...updates };
    });
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Escape key to close modals/popovers
    if (e.key === "Escape") {
      setSubmitError(null);
      setSubmitSuccess(false);
    }
    // Enter key on form fields (except textarea) submits or moves to next
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      const target = e.target as HTMLInputElement;
      if (target.type !== "textarea") {
        e.preventDefault();
        // Find next input
        const form = target.closest("form");
        if (form) {
          const inputs = Array.from(
            form.querySelectorAll("input, select, textarea, button"),
          ) as HTMLElement[];
          const currentIndex = inputs.indexOf(target);
          if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1]?.focus();
          }
        }
      }
    }
  }, []);

  const resetForm = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
    setCurrentStep(1);
    setFormData(INITIAL_FORM_DATA);
    setBirthDate(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 2) {
      goToStep(2);
      return;
    }

    if (!submitIntentRef.current) {
      return;
    }
    submitIntentRef.current = false;

    // Tüm alanları validate et
    const errors: Record<string, string> = {};
    const allFields =
      currentStep === 1
        ? [
            "parentName",
            "parentSurname",
            "parentTc",
            "parentBirthDate",
            "parentPhone",
            "parentEmail",
            "parentDistrict",
            "parentSecondaryAddress",
            "parentSocialSecurity",
            "firstChoiceKresId",
            "secondChoiceKresId",
            "thirdChoiceKresId",
            "fourthChoiceKresId",
            "childFirstName",
            "childLastName",
            "childGender",
            "childTcno",
            "childBirthDate",
            "childToiletTrained",
            "hasChronicDisease",
            "isMunicipalityEmployee",
          ]
        : [
            "familyMemberCount",
            "studentCount",
            "areParentsSeparated",
            "hasDisabledPersonAtHome",
            "isMotherWorking",
            "isFatherWorking",
            "isMotherDisabled",
            "isFatherDisabled",
            "isMotherHealthy",
            "isFatherHealthy",
            "hasPensionMember",
            "houseOwnership",
            "heatingType",
            "workingMemberCount",
            "hasOtherIncome",
            "totalIncomeRangeId",
          ];

    allFields.forEach((field) => {
      const value = formData[field as keyof typeof formData] || "";
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
        setTouchedFields((prev) => new Set(prev).add(field));
      }
    });

    // Özel validasyonlar - çocuk gelişim merkezi tercihleri birbirinden farklı olmalı
    if (currentStep === 1) {
      const c2 =
        formData.secondChoiceKresId && formData.secondChoiceKresId !== "none"
          ? formData.secondChoiceKresId
          : "";
      const c3 =
        formData.thirdChoiceKresId && formData.thirdChoiceKresId !== "none"
          ? formData.thirdChoiceKresId
          : "";
      const c4 =
        formData.fourthChoiceKresId && formData.fourthChoiceKresId !== "none"
          ? formData.fourthChoiceKresId
          : "";
      const choices = [formData.firstChoiceKresId, c2, c3, c4].filter(Boolean);
      const unique = new Set(choices);
      if (unique.size !== choices.length) {
        errors["secondChoiceKresId"] = "Tercihler birbirinden farklı olmalıdır";
      }

      // Seçilen tercihlerin çocuğun yaş grubuna uygunluğunu kontrol et
      const choiceFields = [
        { field: "firstChoiceKresId", id: formData.firstChoiceKresId },
        { field: "secondChoiceKresId", id: c2 },
        { field: "thirdChoiceKresId", id: c3 },
        { field: "fourthChoiceKresId", id: c4 },
      ];
      choiceFields.forEach(({ field, id }) => {
        if (!id) return;
        const k = kindergartens.find((kg) => kg.id === id);
        if (!k) return;
        const compat = getKindergartenCompatibility(k);
        if (!compat.eligible && compat.reason) {
          errors[field] =
            `"${k.name}" bu başvuru için uygun değil: ${compat.reason}`;
          setTouchedFields((prev) => new Set(prev).add(field));
        }
      });
    }

    // Kronik hastalık "Evet" ise açıklama zorunlu (soru artık adım 1'de)
    if (
      currentStep === 1 &&
      formData.hasChronicDisease === "evet" &&
      !(formData.chronicDiseaseNote || "").trim()
    ) {
      errors.chronicDiseaseNote = "Lütfen kronik hastalık açıklaması giriniz";
      setTouchedFields((prev) => new Set(prev).add("chronicDiseaseNote"));
    }

    // Çocuk yaşı o yılın 1 Eylülünde 3–6 yaş aralığında olmalı
    if (currentStep === 1) {
      const ageError = validateChildAgeForKres();
      if (ageError) {
        errors.childBirthDate = ageError;
        setTouchedFields((prev) => new Set(prev).add("childBirthDate"));
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError("Lütfen formu eksiksiz doldurunuz");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      // Date objesi varsa onu kullan, yoksa string'den parse et
      let birthDateFormatted: string;
      if (birthDate) {
        const year = birthDate.getFullYear();
        const month = String(birthDate.getMonth() + 1).padStart(2, "0");
        const day = String(birthDate.getDate()).padStart(2, "0");
        birthDateFormatted = `${year}-${month}-${day}`;
      } else {
        birthDateFormatted = convertDateToApiFormat(formData.parentBirthDate);
      }
      if (!birthDateFormatted) throw new Error("Doğum tarihi geçersiz");

      // Çocuk doğum tarihi formatla
      let childBirthDateFormatted: string | null = null;
      if (childBirthDate) {
        const year = childBirthDate.getFullYear();
        const month = String(childBirthDate.getMonth() + 1).padStart(2, "0");
        const day = String(childBirthDate.getDate()).padStart(2, "0");
        childBirthDateFormatted = `${year}-${month}-${day}`;
      } else if (formData.childBirthDate) {
        childBirthDateFormatted = convertDateToApiFormat(
          formData.childBirthDate,
        );
      }

      // API Payload Mapping
      const apiData = {
        fullName: `${formData.parentName} ${formData.parentSurname}`.trim(),
        phone: formData.parentPhone || null,
        notes: formData.explanation || null,
        tcno: formData.parentTc,
        birthDate: birthDateFormatted,
        adress: formData.parentSecondaryAddress || null,
        district: formData.parentDistrict || null,
        neighborhood: null,
        street: null,
        secondaryAddress: formData.parentSecondaryAddress || null,
        socialSecurity:
          formData.parentSocialSecurity === "bagkur"
            ? "BAĞ-KUR"
            : formData.parentSocialSecurity === "ssk"
              ? "SSK"
              : formData.parentSocialSecurity === "emekli_sandigi"
                ? "Emekli Sandığı"
                : formData.parentSocialSecurity,
        familySize: parseInt(formData.familyMemberCount) || 1,
        numberOfStudentsInFamily: parseInt(formData.studentCount) || 0,
        familyPensionAmount: null,
        chronicDisease: formData.hasChronicDisease === "evet",
        chronicDiseaseNote:
          formData.hasChronicDisease === "evet"
            ? String(formData.chronicDiseaseNote?.trim() ?? "")
            : null,
        houseRentalFee:
          formData.houseOwnership === "kira"
            ? parseInt(formData.rentAmount)
            : null,
        houseHeatingSystem:
          formData.heatingType === "dogalgaz" ? "doğalgaz" : "kömür",
        employeesNumberOfFamily: parseInt(formData.workingMemberCount) || 0,
        additionalIncome: formData.hasOtherIncome === "evet",
        socialAssistanceHistory: null,
        incomeRangeId: formData.totalIncomeRangeId
          ? parseInt(formData.totalIncomeRangeId)
          : null,
        firstChoiceKresId: parseInt(formData.firstChoiceKresId) || null,
        secondChoiceKresId:
          formData.secondChoiceKresId && formData.secondChoiceKresId !== "none"
            ? parseInt(formData.secondChoiceKresId)
            : null,
        thirdChoiceKresId:
          formData.thirdChoiceKresId && formData.thirdChoiceKresId !== "none"
            ? parseInt(formData.thirdChoiceKresId)
            : null,
        fourthChoiceKresId:
          formData.fourthChoiceKresId && formData.fourthChoiceKresId !== "none"
            ? parseInt(formData.fourthChoiceKresId)
            : null,
        childTcno: formData.childTcno || null,
        childBirthDate: childBirthDateFormatted,
        childFirstName: formData.childFirstName || null,
        childLastName: formData.childLastName || null,
        childToiletTrained: formData.childToiletTrained === "evet",
        childGender:
          formData.childGender === "erkek"
            ? "erkek"
            : formData.childGender === "kız"
              ? "kız"
              : null,
        areParentsSeparated: formData.areParentsSeparated === "evet",
        isMotherHealthy: formData.isMotherHealthy === "evet",
        isFatherHealthy: formData.isFatherHealthy === "evet",
        hasDisabledPersonAtHome: formData.hasDisabledPersonAtHome === "evet",
        isMotherWorking: formData.isMotherWorking === "evet",
        isFatherWorking: formData.isFatherWorking === "evet",
        isMotherDisabled: formData.isMotherDisabled === "evet",
        isFatherDisabled: formData.isFatherDisabled === "evet",
        isMunicipalityEmployee: formData.isMunicipalityEmployee === "evet",
      };

      if (isKresMockMode) {
        setSubmitError(null);
        router.push("/basvuru/basarili");
        return;
      }

      const response = await fetch(apiConfig.endpoints.applications.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (isDev) {
          console.error("[Başvuru API]", {
            status: response.status,
            statusText: response.statusText,
            url: apiConfig.endpoints.applications.create,
            errorData,
          });
        }
        const serverMessage =
          errorData.message || errorData.error || "Başvuru gönderilemedi";
        throw new Error(serverMessage);
      }

      // Başarılı gönderim - başarı sayfasına yönlendir
      setSubmitError(null);
      router.push("/basvuru/basarili");
    } catch (error: unknown) {
      if (isDev) {
        console.error("[Başvuru gönderim hatası]", error);
      }
      const errorMessage =
        error instanceof Error ? error.message : "Bir hata oluştu";
      // Backend'den gelen anlamlı mesajları doğrudan göster,
      // generic teknik hata mesajlarını kullanıcı dostu metne çevir
      const isTechnicalError =
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("NetworkError") ||
        errorMessage === "Bir hata oluştu";
      setSubmitError(
        isTechnicalError
          ? "Başvuru gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."
          : errorMessage,
      );
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDynamicAgeRangeText = () => "3-6";

  // Çocuk bilgileri tamamlanmış mı kontrolü (tercih yapılabilmesi için gerekli)
  const isChildInfoComplete = useMemo(() => {
    return !!(
      formData.childFirstName.trim() &&
      formData.childLastName.trim() &&
      childBirthDate &&
      formData.childBirthDate.length === 10 &&
      formData.childGender &&
      formData.childTcno.length === 11 &&
      formData.childToiletTrained
    );
  }, [formData, childBirthDate]);

  // Çocuğun 1 Eylül itibarıyla yaşı
  const childAge = useMemo(() => {
    const birth =
      childBirthDate ?? parseDateFromString(formData.childBirthDate);
    if (!birth) return null;
    return getChildAgeAsOfSeptember1(birth);
  }, [childBirthDate, formData.childBirthDate]);

  // Çocuk gelişim merkezinin yaş grubuna uygunluğunu kontrol et (/kresler ageGroups)
  const getKindergartenCompatibility = useCallback(
    (k: Kindergarten): { eligible: boolean; reason: string | null } => {
      if (childAge === null) return { eligible: true, reason: null };
      if (!k.ageGroups || k.ageGroups.length === 0) {
        return { eligible: true, reason: null };
      }
      const eligible = k.ageGroups.some(
        (g) => childAge >= g.minAge && childAge <= g.maxAge,
      );
      if (!eligible) {
        const groupNames = k.ageGroups.map((g) => g.name).join(" , ");
        return {
          eligible: false,
          reason: `Bu yaş grubu için uygun sınıf bulunmamaktadır.`,
        };
      }
      return { eligible: true, reason: null };
    },
    [childAge],
  );

  // Validation Logic
  const isStepValid = () => {
    if (currentStep === 1) {
      return (
        formData.parentName &&
        formData.parentSurname &&
        formData.parentTc.length === 11 &&
        birthDate &&
        formData.parentBirthDate.length === 10 &&
        formData.parentPhone &&
        formData.parentEmail &&
        formData.parentDistrict &&
        formData.parentSecondaryAddress &&
        formData.parentSocialSecurity &&
        formData.firstChoiceKresId &&
        // 2./3./4. çocuk gelişim merkezi tercihi opsiyonel; doluysa hepsi birbirinden farklı olmalı
        (() => {
          const c2 =
            formData.secondChoiceKresId &&
            formData.secondChoiceKresId !== "none"
              ? formData.secondChoiceKresId
              : "";
          const c3 =
            formData.thirdChoiceKresId && formData.thirdChoiceKresId !== "none"
              ? formData.thirdChoiceKresId
              : "";
          const c4 =
            formData.fourthChoiceKresId &&
            formData.fourthChoiceKresId !== "none"
              ? formData.fourthChoiceKresId
              : "";
          const choices = [formData.firstChoiceKresId, c2, c3, c4].filter(
            Boolean,
          );
          return new Set(choices).size === choices.length;
        })() &&
        // Çocuk bilgileri
        formData.childFirstName &&
        formData.childLastName &&
        formData.childGender &&
        formData.childTcno.length === 11 &&
        childBirthDate &&
        formData.childBirthDate.length === 10 &&
        formData.childToiletTrained &&
        formData.hasChronicDisease &&
        (formData.hasChronicDisease !== "evet" ||
          (formData.chronicDiseaseNote || "").trim()) &&
        !validateChildAgeForKres() &&
        // Belediye personeli
        formData.isMunicipalityEmployee
      );
    }
    if (currentStep === 2) {
      const familyCount = parseInt(formData.familyMemberCount) || 0;
      const studentCount = parseInt(formData.studentCount) || 0;
      const workingCount = parseInt(formData.workingMemberCount) || 0;

      return (
        formData.familyMemberCount &&
        formData.studentCount !== "" &&
        studentCount <= familyCount &&
        formData.areParentsSeparated &&
        formData.hasDisabledPersonAtHome &&
        formData.isMotherWorking &&
        formData.isFatherWorking &&
        formData.isMotherDisabled &&
        formData.isFatherDisabled &&
        formData.isMotherHealthy &&
        formData.isFatherHealthy &&
        formData.hasPensionMember &&
        formData.houseOwnership &&
        (formData.houseOwnership !== "kira" || formData.rentAmount) &&
        formData.heatingType &&
        formData.workingMemberCount !== "" &&
        workingCount <= familyCount &&
        formData.hasOtherIncome &&
        formData.totalIncomeRangeId
      );
    }
    return false;
  };

  // Step değişimini kontrol eden yardımcı fonksiyon
  const goToStep = (targetStep: number) => {
    if (targetStep === currentStep) return;

    // Geri gitmek her zaman serbest
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Sadece 2. adıma ileri geçiş var (şu an 2 adım olduğu için)
    if (targetStep === 2 && currentStep === 1) {
      const errors: Record<string, string> = {};
      const step1Fields = [
        "parentName",
        "parentSurname",
        "parentTc",
        "parentBirthDate",
        "parentPhone",
        "parentEmail",
        "parentDistrict",
        "parentSecondaryAddress",
        "parentSocialSecurity",
        "firstChoiceKresId",
        "secondChoiceKresId",
        "thirdChoiceKresId",
        "fourthChoiceKresId",
        "childFirstName",
        "childLastName",
        "childGender",
        "childTcno",
        "childBirthDate",
        "childToiletTrained",
        "hasChronicDisease",
        "isMunicipalityEmployee",
      ] as const;

      step1Fields.forEach((field) => {
        const value = formData[field] || "";
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
        }
      });

      // Kronik hastalık "Evet" ise açıklama zorunlu
      if (
        formData.hasChronicDisease === "evet" &&
        !(formData.chronicDiseaseNote || "").trim()
      ) {
        errors.chronicDiseaseNote = "Lütfen kronik hastalık açıklaması giriniz";
      }

      // Çocuk yaşı o yılın 1 Eylülünde 3–6 yaş aralığında olmalı
      const ageError = validateChildAgeForKres();
      if (ageError) {
        errors.childBirthDate = ageError;
      }

      // Çocuk Gelişim Merkezi tercihleri birbirinden farklı olmalı
      const c2 =
        formData.secondChoiceKresId && formData.secondChoiceKresId !== "none"
          ? formData.secondChoiceKresId
          : "";
      const c3 =
        formData.thirdChoiceKresId && formData.thirdChoiceKresId !== "none"
          ? formData.thirdChoiceKresId
          : "";
      const c4 =
        formData.fourthChoiceKresId && formData.fourthChoiceKresId !== "none"
          ? formData.fourthChoiceKresId
          : "";
      const choices = [formData.firstChoiceKresId, c2, c3, c4].filter(Boolean);
      if (new Set(choices).size !== choices.length) {
        errors["secondChoiceKresId"] = "Tercihler birbirinden farklı olmalıdır";
      }

      // Seçilen tercihlerin çocuğun yaş grubuna uygunluğunu kontrol et
      const choiceFields = [
        { field: "firstChoiceKresId", id: formData.firstChoiceKresId },
        { field: "secondChoiceKresId", id: c2 },
        { field: "thirdChoiceKresId", id: c3 },
        { field: "fourthChoiceKresId", id: c4 },
      ];
      choiceFields.forEach(({ field, id }) => {
        if (!id) return;
        const k = kindergartens.find((kg) => kg.id === id);
        if (!k) return;
        const compat = getKindergartenCompatibility(k);
        if (!compat.eligible && compat.reason) {
          errors[field] =
            `"${k.name}" bu başvuru için uygun değil: ${compat.reason}`;
        }
      });

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        // Hatalı alanları touched işaretle
        setTouchedFields((prev) => {
          const next = new Set(prev);
          Object.keys(errors).forEach((field) => next.add(field));
          return next;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setCurrentStep(2);
      // 2. adıma geçtiğimizde formun en üstüne kaydır
      const root = document.getElementById("application-form-top");
      if (root) {
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div id="application-form-top" className="max-w-4xl mx-auto space-y-8">
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {submitSuccess && "Başvurunuz başarıyla gönderildi"}
        {submitError && `Hata: ${submitError}`}
        {Object.keys(fieldErrors).length > 0 &&
          `${Object.keys(fieldErrors).length} alanda hata var`}
      </div>

      {/* Başarı ve Hata Mesajları - Form hala görünür */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="alert"
            aria-live="polite"
          >
            <Card className="border-2 border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0" aria-hidden="true">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-200 dark:bg-emerald-900/50 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                      Başvurunuz Başarıyla Gönderildi!
                    </h3>
                    <p className="text-sm sm:text-base text-emerald-800 dark:text-emerald-300/90">
                      Başvurunuz sistemimize kaydedilmiştir. Backend kontrolleri
                      yapıldıktan sonra sonuç hakkında bilgilendirileceksiniz.
                      Gerekirse formu düzenleyip tekrar gönderebilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSubmitSuccess(false);
                      }
                    }}
                    className="shrink-0 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                    aria-label="Başarı mesajını kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {submitError && (
          <motion.div
            ref={errorAlertRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
          >
            <Card className="border-2 border-rose-600 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/30 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0" aria-hidden="true">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-rose-200 dark:bg-rose-900/50 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-rose-700 dark:text-rose-300" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-200 mb-1">
                      Başvuru Gönderilemedi
                    </h3>
                    <p className="text-sm sm:text-base text-rose-800 dark:text-rose-300/90">
                      {submitError}
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitError(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSubmitError(null);
                      }
                    }}
                    className="shrink-0 text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
                    aria-label="Hata mesajını kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Progress Steps - Enhanced visual indicator */}
      <div
        className="mb-6 sm:mb-8"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={`Form adımı ${currentStep} / ${STEPS.length}`}
      >
        <div className="flex justify-between items-center relative mb-4 px-2 sm:px-4">
          {/* Progress bar background - görünür olmalı */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 bg-muted rounded-full z-0" />
          {/* Progress bar fill - görünür olmalı */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-primary rounded-full z-0 transition-all duration-500 ease-out shadow-lg shadow-primary/30"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
            aria-hidden="true"
          />

          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="group flex flex-col items-center gap-2 bg-transparent px-2 relative z-10 cursor-pointer transition-transform hover:-translate-y-0.5"
                role="button"
                tabIndex={0}
                aria-label={`${step.title} ${
                  isActive ? "aktif" : isCompleted ? "tamamlandı" : "beklemede"
                }`}
                onClick={() => goToStep(step.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToStep(step.id);
                  }
                }}
              >
                <motion.div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-3 sm:border-4 transition-all duration-300 ${
                    isActive
                      ? "bg-primary border-primary text-white scale-110 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                      : isCompleted
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "bg-background border-muted text-muted-foreground"
                  }`}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </motion.div>
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-primary dark:text-primary"
                      : isCompleted
                        ? "text-primary/80 dark:text-primary/80"
                        : "text-muted-foreground group-hover:text-primary dark:group-hover:text-primary"
                  }`}
                >
                  {step.title}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: 32 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Açıklama Metinleri */}
        <div className="text-center px-4">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {currentStep === 1 && (
              <p className="text-sm sm:text-base text-muted-foreground">
                Lütfen veli bilgilerinizi, çocuk bilgilerinizi ve çocuk gelişim
                merkezi tercihlerinizi eksiksiz doldurunuz. 2. çocuk gelişim
                merkezi tercihi opsiyoneldir.
              </p>
            )}
            {currentStep === 2 && (
              <p className="text-sm sm:text-base text-muted-foreground">
                Aile durumunuz ve ekonomik bilgilerinizi eksiksiz doldurunuz. Bu
                bilgiler başvurunuzun değerlendirilmesi için gereklidir.
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <Card className="border-0 shadow-xl rounded-[1.5rem] sm:rounded-4xl md:rounded-[2.5rem] overflow-hidden bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      Kişisel Bilgiler
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">
                          Ad{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          id="parentName"
                          placeholder="Adınız"
                          value={formData.parentName}
                          onChange={(e) =>
                            handleChange("parentName", e.target.value)
                          }
                          aria-invalid={
                            touchedFields.has("parentName") &&
                            !!fieldErrors["parentName"]
                          }
                          aria-describedby={
                            touchedFields.has("parentName") &&
                            fieldErrors["parentName"]
                              ? "parentName-error"
                              : "parentName-help"
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("parentName") &&
                            fieldErrors["parentName"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("parentName") &&
                        fieldErrors["parentName"] ? (
                          <p
                            id="parentName-error"
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle
                              className="w-3 h-3 shrink-0"
                              aria-hidden="true"
                            />
                            {fieldErrors["parentName"]}
                          </p>
                        ) : (
                          <p id="parentName-help" className="sr-only">
                            Adınızı giriniz
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Soyad <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          placeholder="Soyadınız"
                          value={formData.parentSurname}
                          onChange={(e) =>
                            handleChange("parentSurname", e.target.value)
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("parentSurname") &&
                            fieldErrors["parentSurname"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("parentSurname") &&
                          fieldErrors["parentSurname"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["parentSurname"]}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>
                          T.C. Kimlik No{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          placeholder="11 haneli T.C. No"
                          inputMode="numeric"
                          maxLength={11}
                          value={formData.parentTc}
                          onChange={(e) =>
                            handleChange(
                              "parentTc",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("parentTc") &&
                            fieldErrors["parentTc"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("parentTc") &&
                        fieldErrors["parentTc"] ? (
                          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["parentTc"]}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Sadece rakam. 11 hane olmalıdır.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Doğum Tarihi <span className="text-rose-500">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              className={`w-full h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base justify-start text-left font-normal ${
                                !birthDate && "text-muted-foreground"
                              } ${
                                touchedFields.has("parentBirthDate") &&
                                fieldErrors["parentBirthDate"]
                                  ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                  : ""
                              }`}
                              onClick={() =>
                                setTouchedFields((prev) =>
                                  new Set(prev).add("parentBirthDate"),
                                )
                              }
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {birthDate ? (
                                formatDateToDisplay(birthDate)
                              ) : (
                                <span>Doğum tarihinizi seçiniz</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={birthDate}
                              onSelect={(date) => {
                                setBirthDate(date);
                                if (date) {
                                  const dateStr = formatDateToDisplay(date);
                                  setFormData((prev) => ({
                                    ...prev,
                                    parentBirthDate: dateStr,
                                  }));
                                  // Validate after selection
                                  const error = validateField(
                                    "parentBirthDate",
                                    dateStr,
                                  );
                                  setFieldErrors((prev) => {
                                    const newErrors = { ...prev };
                                    if (error) {
                                      newErrors["parentBirthDate"] = error;
                                    } else {
                                      delete newErrors["parentBirthDate"];
                                    }
                                    return newErrors;
                                  });
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                              captionLayout="dropdown"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        {touchedFields.has("parentBirthDate") &&
                        fieldErrors["parentBirthDate"] ? (
                          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["parentBirthDate"]}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Takvimden doğum tarihinizi seçebilirsiniz.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>
                          Telefon <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          placeholder="05551234567"
                          inputMode="numeric"
                          maxLength={11}
                          value={formData.parentPhone}
                          onChange={(e) =>
                            handleChange(
                              "parentPhone",
                              e.target.value.replace(/\D/g, "").slice(0, 11),
                            )
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("parentPhone") &&
                            fieldErrors["parentPhone"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("parentPhone") &&
                        fieldErrors["parentPhone"] ? (
                          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["parentPhone"]}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Sadece rakam. Örnek: 05551234567
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>
                          E-posta <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          placeholder="ornek@email.com"
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) =>
                            handleChange("parentEmail", e.target.value)
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("parentEmail") &&
                            fieldErrors["parentEmail"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("parentEmail") &&
                          fieldErrors["parentEmail"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["parentEmail"]}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Belediye Personeli */}
                    <div className="space-y-2">
                      <Label>
                        Atakum Belediyesi Personeli misiniz?{" "}
                        <span className="text-rose-600 dark:text-rose-400">
                          *
                        </span>
                      </Label>
                      <RadioGroup
                        value={formData.isMunicipalityEmployee}
                        onValueChange={(v) => {
                          handleChange("isMunicipalityEmployee", v);
                          setTouchedFields((prev) =>
                            new Set(prev).add("isMunicipalityEmployee"),
                          );
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="evet" id="municipality-yes" />
                          <Label htmlFor="municipality-yes">Evet</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hayir" id="municipality-no" />
                          <Label htmlFor="municipality-no">Hayır</Label>
                        </div>
                      </RadioGroup>
                      {touchedFields.has("isMunicipalityEmployee") &&
                        fieldErrors["isMunicipalityEmployee"] && (
                          <p
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["isMunicipalityEmployee"]}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Çocuk Bilgileri */}
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      Çocuk Bilgileri
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="childFirstName">
                          Çocuğun Adı{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          id="childFirstName"
                          placeholder="Çocuğun adı"
                          value={formData.childFirstName}
                          onChange={(e) =>
                            handleChange("childFirstName", e.target.value)
                          }
                          aria-invalid={
                            touchedFields.has("childFirstName") &&
                            !!fieldErrors["childFirstName"]
                          }
                          aria-describedby={
                            touchedFields.has("childFirstName") &&
                            fieldErrors["childFirstName"]
                              ? "childFirstName-error"
                              : "childFirstName-help"
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("childFirstName") &&
                            fieldErrors["childFirstName"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("childFirstName") &&
                        fieldErrors["childFirstName"] ? (
                          <p
                            id="childFirstName-error"
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle
                              className="w-3 h-3 shrink-0"
                              aria-hidden="true"
                            />
                            {fieldErrors["childFirstName"]}
                          </p>
                        ) : (
                          <p id="childFirstName-help" className="sr-only">
                            Çocuğun adını giriniz
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="childLastName">
                          Çocuğun Soyadı{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          id="childLastName"
                          placeholder="Çocuğun soyadı"
                          value={formData.childLastName}
                          onChange={(e) =>
                            handleChange("childLastName", e.target.value)
                          }
                          aria-invalid={
                            touchedFields.has("childLastName") &&
                            !!fieldErrors["childLastName"]
                          }
                          aria-describedby={
                            touchedFields.has("childLastName") &&
                            fieldErrors["childLastName"]
                              ? "childLastName-error"
                              : "childLastName-help"
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("childLastName") &&
                            fieldErrors["childLastName"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("childLastName") &&
                        fieldErrors["childLastName"] ? (
                          <p
                            id="childLastName-error"
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle
                              className="w-3 h-3 shrink-0"
                              aria-hidden="true"
                            />
                            {fieldErrors["childLastName"]}
                          </p>
                        ) : (
                          <p id="childLastName-help" className="sr-only">
                            Çocuğun soyadını giriniz
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>
                          Çocuğun T.C. Kimlik No{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          placeholder="11 haneli T.C. No"
                          inputMode="numeric"
                          maxLength={11}
                          value={formData.childTcno}
                          onChange={(e) =>
                            handleChange(
                              "childTcno",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={`h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base ${
                            touchedFields.has("childTcno") &&
                            fieldErrors["childTcno"]
                              ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                              : ""
                          }`}
                        />
                        {touchedFields.has("childTcno") &&
                        fieldErrors["childTcno"] ? (
                          <p
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["childTcno"]}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Sadece rakam. 11 hane olmalıdır.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Çocuğun Doğum Tarihi{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              className={`w-full h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base justify-start text-left font-normal ${
                                !childBirthDate && "text-muted-foreground"
                              } ${
                                touchedFields.has("childBirthDate") &&
                                fieldErrors["childBirthDate"]
                                  ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                  : ""
                              }`}
                              onClick={() =>
                                setTouchedFields((prev) =>
                                  new Set(prev).add("childBirthDate"),
                                )
                              }
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {childBirthDate ? (
                                formatDateToDisplay(childBirthDate)
                              ) : (
                                <span>Doğum tarihini seçiniz</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={childBirthDate}
                              onSelect={(date) => {
                                setChildBirthDate(date);
                                setTouchedFields((prev) =>
                                  new Set(prev).add("childBirthDate"),
                                );
                                if (date) {
                                  const dateStr = formatDateToDisplay(date);
                                  setFormData((prev) => ({
                                    ...prev,
                                    childBirthDate: dateStr,
                                  }));
                                  // Önce yaş (3–6, 1 Eylül) kontrolü, sonra format
                                  const ageError =
                                    validateChildAgeForKres(date);
                                  const formatError = validateField(
                                    "childBirthDate",
                                    dateStr,
                                  );
                                  const error = ageError ?? formatError ?? null;
                                  setFieldErrors((prev) => {
                                    const newErrors = { ...prev };
                                    if (error) {
                                      newErrors["childBirthDate"] = error;
                                    } else {
                                      delete newErrors["childBirthDate"];
                                    }
                                    return newErrors;
                                  });
                                } else {
                                  setFieldErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors["childBirthDate"];
                                    return newErrors;
                                  });
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01") ||
                                validateChildAgeForKres(date) !== null
                              }
                              initialFocus
                              captionLayout="dropdown"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        {fieldErrors["childBirthDate"] ? (
                          <p
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium mt-1"
                            role="alert"
                          >
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {fieldErrors["childBirthDate"]}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            Takvimden doğum tarihini seçebilirsiniz. Çocuğun o
                            yılın 1 Eylülünde {getDynamicAgeRangeText()} yaş
                            arasında olması gerekir.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Çocuğun Cinsiyeti{" "}
                        <span className="text-rose-600 dark:text-rose-400">
                          *
                        </span>
                      </Label>
                      <RadioGroup
                        value={formData.childGender}
                        onValueChange={(v) => {
                          handleChange("childGender", v);
                          setTouchedFields((prev) =>
                            new Set(prev).add("childGender"),
                          );
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="erkek" id="child-gender-m" />
                          <Label htmlFor="child-gender-m">Erkek</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="kız" id="child-gender-f" />
                          <Label htmlFor="child-gender-f">Kız</Label>
                        </div>
                      </RadioGroup>
                      {touchedFields.has("childGender") &&
                        fieldErrors["childGender"] && (
                          <p
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["childGender"]}
                          </p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Tuvalet Eğitimi var mı?{" "}
                        <span className="text-rose-600 dark:text-rose-400">
                          *
                        </span>
                      </Label>
                      <RadioGroup
                        value={formData.childToiletTrained}
                        onValueChange={(v) => {
                          handleChange("childToiletTrained", v);
                          setTouchedFields((prev) =>
                            new Set(prev).add("childToiletTrained"),
                          );
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="evet" id="toilet-yes" />
                          <Label htmlFor="toilet-yes">Evet</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hayir" id="toilet-no" />
                          <Label htmlFor="toilet-no">Hayır</Label>
                        </div>
                      </RadioGroup>
                      {touchedFields.has("childToiletTrained") &&
                        fieldErrors["childToiletTrained"] && (
                          <p
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["childToiletTrained"]}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Kronik Hastalık - çocuk bilgilerinin altında */}
                  <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                    <Label>Kronik Hastalık Var mı?</Label>
                    <RadioGroup
                      value={formData.hasChronicDisease}
                      onValueChange={(v) =>
                        handleChange("hasChronicDisease", v)
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="evet" id="r-chronic-yes" />
                        <Label htmlFor="r-chronic-yes">Evet</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hayir" id="r-chronic-no" />
                        <Label htmlFor="r-chronic-no">Hayır</Label>
                      </div>
                    </RadioGroup>
                    {formData.hasChronicDisease === "evet" && (
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="chronicDiseaseNote">
                          Kronik Hastalık Açıklaması
                        </Label>
                        <textarea
                          id="chronicDiseaseNote"
                          value={formData.chronicDiseaseNote}
                          onChange={(e) =>
                            handleChange("chronicDiseaseNote", e.target.value)
                          }
                          placeholder="Lütfen kronik hastalığı kısaca açıklayınız"
                          rows={3}
                          className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            fieldErrors["chronicDiseaseNote"]
                              ? "border-destructive"
                              : "border-input"
                          }`}
                          aria-label="Kronik hastalık açıklaması"
                          aria-invalid={!!fieldErrors["chronicDiseaseNote"]}
                        />
                        {fieldErrors["chronicDiseaseNote"] && (
                          <p className="text-sm text-destructive">
                            {fieldErrors["chronicDiseaseNote"]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                      Adres Bilgileri
                    </h3>

                    {/*                     <div className="space-y-2">
                      <Label htmlFor="parentAddress">
                        Adres <span className="text-muted-foreground text-sm">(Opsiyonel)</span>
                      </Label>
                      <Input
                        id="parentAddress"
                        placeholder="Adres bilgisi"
                        value={formData.parentAddress}
                        onChange={(e) =>
                          handleChange("parentAddress", e.target.value)
                        }
                        className="h-11 sm:h-12 rounded-xl bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm sm:text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Genel adres bilgisi (opsiyonel)
                      </p>
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label>
                          İlçe <span className="text-rose-500">*</span>
                        </Label>
                        <Select
                          value={formData.parentDistrict}
                          onValueChange={(v) => {
                            handleChange("parentDistrict", v);
                            setTouchedFields((prev) =>
                              new Set(prev).add("parentDistrict"),
                            );
                          }}
                        >
                          <SelectTrigger
                            className={`h-11 sm:h-12 w-full rounded-xl bg-muted/30 border-transparent text-sm sm:text-base ${
                              touchedFields.has("parentDistrict") &&
                              fieldErrors["parentDistrict"]
                                ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {touchedFields.has("parentDistrict") &&
                          fieldErrors["parentDistrict"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["parentDistrict"]}
                            </p>
                          )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Detaylı Adres{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Lütfen açık adresinizi (sokak, cadde, bina no, daire no
                        vb.) detaylı olarak giriniz.
                      </p>
                      <Textarea
                        placeholder="Açık adresiniz..."
                        className={`rounded-xl bg-muted/30 border-transparent min-h-[80px] text-sm sm:text-base ${
                          touchedFields.has("parentSecondaryAddress") &&
                          fieldErrors["parentSecondaryAddress"]
                            ? "border-rose-500 focus:border-rose-500"
                            : ""
                        }`}
                        value={formData.parentSecondaryAddress}
                        onChange={(e) =>
                          handleChange("parentSecondaryAddress", e.target.value)
                        }
                        required
                      />
                      {touchedFields.has("parentSecondaryAddress") &&
                        fieldErrors["parentSecondaryAddress"] && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["parentSecondaryAddress"]}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                      Tercihler
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label>
                          Sosyal Güvence{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Select
                          value={formData.parentSocialSecurity}
                          onValueChange={(v) => {
                            handleChange("parentSocialSecurity", v);
                            setTouchedFields((prev) =>
                              new Set(prev).add("parentSocialSecurity"),
                            );
                          }}
                        >
                          <SelectTrigger
                            className={`h-11 sm:h-12 w-full rounded-xl bg-muted/30 border-transparent text-sm sm:text-base ${
                              touchedFields.has("parentSocialSecurity") &&
                              fieldErrors["parentSocialSecurity"]
                                ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bagkur">BAĞ-KUR</SelectItem>
                            <SelectItem value="ssk">SSK</SelectItem>
                            <SelectItem value="emekli_sandigi">
                              Emekli Sandığı
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {touchedFields.has("parentSocialSecurity") &&
                          fieldErrors["parentSocialSecurity"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["parentSocialSecurity"]}
                            </p>
                          )}
                      </div>
                      <div className="space-y-2">
                        {/* Empty Space filler or another field */}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label className="text-primary font-bold">
                          1. Çocuk Gelişim Merkezi Tercihi
                        </Label>
                        <Select
                          disabled={
                            loadingKindergartens || !isChildInfoComplete
                          }
                          value={formData.firstChoiceKresId}
                          onValueChange={(v) => {
                            handleChange("firstChoiceKresId", v);
                            setTouchedFields((prev) =>
                              new Set(prev).add("firstChoiceKresId"),
                            );
                          }}
                        >
                          <SelectTrigger
                            className={`h-12 w-full rounded-xl bg-primary/5 border-primary/20 ${
                              touchedFields.has("firstChoiceKresId") &&
                              fieldErrors["firstChoiceKresId"]
                                ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                loadingKindergartens
                                  ? "Çocuk Gelişim Merkezleri yükleniyor..."
                                  : !isChildInfoComplete
                                    ? "Önce çocuk bilgilerini doldurunuz"
                                    : "Seçiniz"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {kindergartens.map((k) => {
                              const compat = getKindergartenCompatibility(k);
                              return (
                                <SelectItem
                                  key={k.id}
                                  value={k.id.toString()}
                                  textValue={k.name}
                                  disabled={
                                    formData.secondChoiceKresId ===
                                      k.id.toString() || !compat.eligible
                                  }
                                >
                                  <span>{k.name}</span>
                                  {!compat.eligible && compat.reason && (
                                    <span className="text-rose-500 ml-1 text-xs">
                                      ({compat.reason})
                                    </span>
                                  )}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {!isChildInfoComplete && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Tercih yapabilmek için önce çocuk bilgilerini
                            eksiksiz doldurunuz.
                          </p>
                        )}
                        {touchedFields.has("firstChoiceKresId") &&
                          fieldErrors["firstChoiceKresId"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["firstChoiceKresId"]}
                            </p>
                          )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary font-bold">
                          2. Çocuk Gelişim Merkezi Tercihi{" "}
                          <span className="text-muted-foreground text-sm font-normal">
                            (Opsiyonel)
                          </span>
                        </Label>
                        <Select
                          disabled={
                            loadingKindergartens ||
                            !isChildInfoComplete ||
                            !formData.firstChoiceKresId
                          }
                          value={formData.secondChoiceKresId}
                          onValueChange={(v) => {
                            handleChange("secondChoiceKresId", v);
                            setTouchedFields((prev) =>
                              new Set(prev).add("secondChoiceKresId"),
                            );
                          }}
                        >
                          <SelectTrigger
                            className={`h-12 w-full rounded-xl bg-primary/5 border-primary/20 ${
                              touchedFields.has("secondChoiceKresId") &&
                              fieldErrors["secondChoiceKresId"]
                                ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                loadingKindergartens
                                  ? "Çocuk Gelişim Merkezleri yükleniyor..."
                                  : !isChildInfoComplete
                                    ? "Önce çocuk bilgilerini doldurunuz"
                                    : !formData.firstChoiceKresId
                                      ? "Önce 1. tercihi seçiniz"
                                      : "Seçiniz"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Seçmek istemiyorum
                            </SelectItem>
                            {kindergartens.map((k) => {
                              const compat = getKindergartenCompatibility(k);
                              return (
                                <SelectItem
                                  key={k.id}
                                  value={k.id.toString()}
                                  textValue={k.name}
                                  disabled={
                                    formData.firstChoiceKresId ===
                                      k.id.toString() || !compat.eligible
                                  }
                                >
                                  <span>{k.name}</span>
                                  {!compat.eligible && compat.reason && (
                                    <span className="text-rose-500 ml-1 text-xs">
                                      ({compat.reason})
                                    </span>
                                  )}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {touchedFields.has("secondChoiceKresId") &&
                          fieldErrors["secondChoiceKresId"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["secondChoiceKresId"]}
                            </p>
                          )}
                        {formData.firstChoiceKresId &&
                          formData.secondChoiceKresId &&
                          formData.firstChoiceKresId ===
                            formData.secondChoiceKresId && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              İki tercih farklı olmalıdır
                            </p>
                          )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary font-bold">
                          3. Çocuk Gelişim Merkezi Tercihi{" "}
                          <span className="text-muted-foreground text-sm font-normal">
                            (Opsiyonel)
                          </span>
                        </Label>
                        <Select
                          disabled={
                            loadingKindergartens ||
                            !isChildInfoComplete ||
                            !formData.firstChoiceKresId ||
                            !formData.secondChoiceKresId
                          }
                          value={formData.thirdChoiceKresId}
                          onValueChange={(v) => {
                            handleChange("thirdChoiceKresId", v);
                            setTouchedFields((prev) =>
                              new Set(prev).add("thirdChoiceKresId"),
                            );
                          }}
                        >
                          <SelectTrigger
                            className={`h-12 w-full rounded-xl bg-primary/5 border-primary/20 ${
                              touchedFields.has("thirdChoiceKresId") &&
                              fieldErrors["thirdChoiceKresId"]
                                ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                loadingKindergartens
                                  ? "Çocuk Gelişim Merkezleri yükleniyor..."
                                  : !isChildInfoComplete
                                    ? "Önce çocuk bilgilerini doldurunuz"
                                    : !formData.secondChoiceKresId
                                      ? "Önce 2. tercihi seçiniz"
                                      : "Seçiniz"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Seçmek istemiyorum
                            </SelectItem>
                            {kindergartens.map((k) => {
                              const compat = getKindergartenCompatibility(k);
                              return (
                                <SelectItem
                                  key={k.id}
                                  value={k.id.toString()}
                                  textValue={k.name}
                                  disabled={
                                    formData.firstChoiceKresId ===
                                      k.id.toString() ||
                                    formData.secondChoiceKresId ===
                                      k.id.toString() ||
                                    !compat.eligible
                                  }
                                >
                                  <span>{k.name}</span>
                                  {!compat.eligible && compat.reason && (
                                    <span className="text-rose-500 ml-1 text-xs">
                                      ({compat.reason})
                                    </span>
                                  )}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {touchedFields.has("thirdChoiceKresId") &&
                          fieldErrors["thirdChoiceKresId"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["thirdChoiceKresId"]}
                            </p>
                          )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary font-bold">
                          4. Çocuk Gelişim Merkezi Tercihi{" "}
                          <span className="text-muted-foreground text-sm font-normal">
                            (Opsiyonel)
                          </span>
                        </Label>
                        <Select
                          disabled={
                            loadingKindergartens ||
                            !isChildInfoComplete ||
                            !formData.firstChoiceKresId ||
                            !formData.secondChoiceKresId ||
                            !formData.thirdChoiceKresId
                          }
                          value={formData.fourthChoiceKresId}
                          onValueChange={(v) => {
                            handleChange("fourthChoiceKresId", v);
                            setTouchedFields((prev) =>
                              new Set(prev).add("fourthChoiceKresId"),
                            );
                          }}
                        >
                          <SelectTrigger
                            className={`h-12 w-full rounded-xl bg-primary/5 border-primary/20 ${
                              touchedFields.has("fourthChoiceKresId") &&
                              fieldErrors["fourthChoiceKresId"]
                                ? "border-rose-600 dark:border-rose-500 focus:border-rose-600 dark:focus:border-rose-500"
                                : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                loadingKindergartens
                                  ? "Çocuk Gelişim Merkezleri yükleniyor..."
                                  : !isChildInfoComplete
                                    ? "Önce çocuk bilgilerini doldurunuz"
                                    : !formData.thirdChoiceKresId
                                      ? "Önce 3. tercihi seçiniz"
                                      : "Seçiniz"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Seçmek istemiyorum
                            </SelectItem>
                            {kindergartens.map((k) => {
                              const compat = getKindergartenCompatibility(k);
                              return (
                                <SelectItem
                                  key={k.id}
                                  value={k.id.toString()}
                                  textValue={k.name}
                                  disabled={
                                    formData.firstChoiceKresId ===
                                      k.id.toString() ||
                                    formData.secondChoiceKresId ===
                                      k.id.toString() ||
                                    formData.thirdChoiceKresId ===
                                      k.id.toString() ||
                                    !compat.eligible
                                  }
                                >
                                  <span>{k.name}</span>
                                  {!compat.eligible && compat.reason && (
                                    <span className="text-rose-500 ml-1 text-xs">
                                      ({compat.reason})
                                    </span>
                                  )}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {touchedFields.has("fourthChoiceKresId") &&
                          fieldErrors["fourthChoiceKresId"] && (
                            <p
                              className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors["fourthChoiceKresId"]}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
                      <Users className="w-5 h-5" />
                      Aile Durumu
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label>
                          Aile Kişi Sayısı{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.familyMemberCount}
                          onChange={(e) =>
                            handleChange("familyMemberCount", e.target.value)
                          }
                          className="h-11 sm:h-12 rounded-xl bg-muted/30 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Öğrenci Sayısı{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={formData.studentCount}
                          onChange={(e) =>
                            handleChange("studentCount", e.target.value)
                          }
                          className="h-11 sm:h-12 rounded-xl bg-muted/30 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Çalışan Sayısı{" "}
                          <span className="text-rose-600 dark:text-rose-400">
                            *
                          </span>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={formData.workingMemberCount}
                          onChange={(e) =>
                            handleChange("workingMemberCount", e.target.value)
                          }
                          className="h-11 sm:h-12 rounded-xl bg-muted/30 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Ebeveynler ayrı mı?</Label>
                        <RadioGroup
                          value={formData.areParentsSeparated}
                          onValueChange={(v) =>
                            handleChange("areParentsSeparated", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="parents-sep-y" />
                            <Label htmlFor="parents-sep-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hayir" id="parents-sep-n" />
                            <Label htmlFor="parents-sep-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Evde bakıma muhtaç kişi var mı?</Label>
                        <RadioGroup
                          value={formData.hasDisabledPersonAtHome}
                          onValueChange={(v) =>
                            handleChange("hasDisabledPersonAtHome", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="disabled-home-y" />
                            <Label htmlFor="disabled-home-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="hayir"
                              id="disabled-home-n"
                            />
                            <Label htmlFor="disabled-home-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Anne çalışıyor mu?</Label>
                        <RadioGroup
                          value={formData.isMotherWorking}
                          onValueChange={(v) =>
                            handleChange("isMotherWorking", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="mother-work-y" />
                            <Label htmlFor="mother-work-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hayir" id="mother-work-n" />
                            <Label htmlFor="mother-work-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Baba çalışıyor mu?</Label>
                        <RadioGroup
                          value={formData.isFatherWorking}
                          onValueChange={(v) =>
                            handleChange("isFatherWorking", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="father-work-y" />
                            <Label htmlFor="father-work-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hayir" id="father-work-n" />
                            <Label htmlFor="father-work-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Anne engelli mi?</Label>
                        <RadioGroup
                          value={formData.isMotherDisabled}
                          onValueChange={(v) =>
                            handleChange("isMotherDisabled", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="mother-dis-y" />
                            <Label htmlFor="mother-dis-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hayir" id="mother-dis-n" />
                            <Label htmlFor="mother-dis-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Baba engelli mi?</Label>
                        <RadioGroup
                          value={formData.isFatherDisabled}
                          onValueChange={(v) =>
                            handleChange("isFatherDisabled", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="father-dis-y" />
                            <Label htmlFor="father-dis-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hayir" id="father-dis-n" />
                            <Label htmlFor="father-dis-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Anne sağ mı? (yaşıyor mu)</Label>
                        <RadioGroup
                          value={formData.isMotherHealthy}
                          onValueChange={(v) =>
                            handleChange("isMotherHealthy", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="mother-health-y" />
                            <Label htmlFor="mother-health-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="hayir"
                              id="mother-health-n"
                            />
                            <Label htmlFor="mother-health-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                        <Label>Baba sağ mı? (yaşıyor mu)</Label>
                        <RadioGroup
                          value={formData.isFatherHealthy}
                          onValueChange={(v) =>
                            handleChange("isFatherHealthy", v)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evet" id="father-health-y" />
                            <Label htmlFor="father-health-y">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="hayir"
                              id="father-health-n"
                            />
                            <Label htmlFor="father-health-n">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    {(touchedFields.has("areParentsSeparated") &&
                      fieldErrors["areParentsSeparated"]) ||
                    (touchedFields.has("hasDisabledPersonAtHome") &&
                      fieldErrors["hasDisabledPersonAtHome"]) ||
                    (touchedFields.has("isMotherWorking") &&
                      fieldErrors["isMotherWorking"]) ||
                    (touchedFields.has("isFatherWorking") &&
                      fieldErrors["isFatherWorking"]) ||
                    (touchedFields.has("isMotherDisabled") &&
                      fieldErrors["isMotherDisabled"]) ||
                    (touchedFields.has("isFatherDisabled") &&
                      fieldErrors["isFatherDisabled"]) ||
                    (touchedFields.has("isMotherHealthy") &&
                      fieldErrors["isMotherHealthy"]) ||
                    (touchedFields.has("isFatherHealthy") &&
                      fieldErrors["isFatherHealthy"]) ? (
                      <p
                        className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3" />
                        Lütfen tüm soruları cevaplayınız
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
                      <Wallet className="w-5 h-5" />
                      Ekonomik Durum & Detaylar
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      {/* Sol Kolon */}
                      <div className="space-y-6">
                        <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                          <Label>Maaş Alan (Emekli/Engelli) Var mı?</Label>
                          <RadioGroup
                            value={formData.hasPensionMember}
                            onValueChange={(v) =>
                              handleChange("hasPensionMember", v)
                            }
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="evet" id="r3" />
                              <Label htmlFor="r3">Evet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hayir" id="r4" />
                              <Label htmlFor="r4">Hayır</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                          <Label>Ev Mülkiyet Durumu</Label>
                          <Select
                            value={formData.houseOwnership}
                            onValueChange={(v) =>
                              handleChange("houseOwnership", v)
                            }
                          >
                            <SelectTrigger className="h-10 w-full bg-background">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kendi">Kendine Ait</SelectItem>
                              <SelectItem value="kira">Kira</SelectItem>
                            </SelectContent>
                          </Select>
                          {formData.houseOwnership === "kira" && (
                            <Input
                              type="number"
                              placeholder="Kira Tutarı (TL)"
                              value={formData.rentAmount}
                              onChange={(e) =>
                                handleChange("rentAmount", e.target.value)
                              }
                              className="h-10 mt-2 bg-background"
                            />
                          )}
                        </div>
                      </div>

                      {/* Sağ Kolon */}
                      <div className="space-y-6">
                        <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                          <Label>Maaş Dışı Gelir Var mı?</Label>
                          <RadioGroup
                            value={formData.hasOtherIncome}
                            onValueChange={(v) =>
                              handleChange("hasOtherIncome", v)
                            }
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="evet" id="r7" />
                              <Label htmlFor="r7">Evet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hayir" id="r8" />
                              <Label htmlFor="r8">Hayır</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-3 p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/50">
                          <Label>Isınma Türü</Label>
                          <RadioGroup
                            value={formData.heatingType}
                            onValueChange={(v) =>
                              handleChange("heatingType", v)
                            }
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="dogalgaz" id="r11" />
                              <Label htmlFor="r11">Doğalgaz</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="komur" id="r12" />
                              <Label htmlFor="r12">Kömür</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base sm:text-lg font-bold text-primary">
                        Ailenin Toplam Geliri (TL)
                      </Label>
                      <Select
                        disabled={loadingIncomeRanges}
                        value={formData.totalIncomeRangeId}
                        onValueChange={(v) => {
                          handleChange("totalIncomeRangeId", v);
                          setTouchedFields((prev) =>
                            new Set(prev).add("totalIncomeRangeId"),
                          );
                        }}
                      >
                        <SelectTrigger
                          className={`h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 focus:border-green-500 text-green-700 dark:text-green-300 ${
                            touchedFields.has("totalIncomeRangeId") &&
                            fieldErrors["totalIncomeRangeId"]
                              ? "border-rose-500 focus:border-rose-500"
                              : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              loadingIncomeRanges
                                ? "Gelir aralıkları yükleniyor..."
                                : "Gelir aralığı seçiniz"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {incomeRanges.map((range) => (
                            <SelectItem
                              key={range.id}
                              value={range.id.toString()}
                            >
                              {range.minIncome.toLocaleString("tr-TR")} -{" "}
                              {range.maxIncome >= 999999
                                ? "üzeri"
                                : range.maxIncome.toLocaleString("tr-TR")}{" "}
                              TL
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {touchedFields.has("totalIncomeRangeId") &&
                        fieldErrors["totalIncomeRangeId"] && (
                          <p
                            className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium"
                            role="alert"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors["totalIncomeRangeId"]}
                          </p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label>Eklemek İstedikleriniz</Label>
                      <Textarea
                        value={formData.explanation}
                        onChange={(e) =>
                          handleChange("explanation", e.target.value)
                        }
                        className="rounded-xl bg-muted/30 border-transparent text-sm sm:text-base min-h-[100px]"
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/50">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    submitIntentRef.current = false;
                    setCurrentStep((prev) => prev - 1);
                  }}
                  className="rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Geri Dön
                </Button>
              )}

              {currentStep < 2 ? (
                <Button
                  type="button"
                  onClick={() => goToStep(2)}
                  disabled={!isStepValid()}
                  className="sm:ml-auto rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base shadow-lg shadow-primary/20 w-full sm:w-auto"
                >
                  Devam Et
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isStepValid()}
                  onMouseDown={() => {
                    submitIntentRef.current = true;
                  }}
                  className="sm:ml-auto rounded-full px-6 sm:px-8 md:px-10 h-11 sm:h-12 text-sm sm:text-base shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                      Gönderiliyor...
                    </>
                  ) : (
                    "Başvuruyu Tamamla"
                  )}
                </Button>
              )}
            </div>
          </form>
          <FakeFormFiller
            currentStep={currentStep}
            kindergartens={kindergartens}
            setFormData={setFormData}
            setBirthDate={setBirthDate}
            setChildBirthDate={setChildBirthDate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
