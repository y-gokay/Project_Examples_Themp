import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Input,
  Button,
} from "../ui";
import { FileText, Plus, X, Loader2 } from "lucide-react";
import { showToast } from "../ui/Toast";

/**
 * ExamsSection Component
 * Manages user's exam records (add/remove)
 *
 * @param {Object} props
 * @param {Object} props.user - User object with exams array
 * @param {Object} props.lookups - Lookup data (exams)
 * @param {Function} props.onAddExam - Handler for adding an exam
 * @param {Function} props.onRemoveExam - Handler for removing an exam
 * @param {boolean} props.loading - Loading state
 */
const ExamsSection = ({
  user,
  lookups,
  onAddExam,
  onRemoveExam,
  loading = false,
}) => {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examPoint, setExamPoint] = useState("");
  const [examAttemptDate, setExamAttemptDate] = useState("");
  const [addingExam, setAddingExam] = useState(false);
  const [removingExamId, setRemovingExamId] = useState(null);

  // Get user's current exam IDs
  const userExamIds = (user?.exams || [])
    .map((ex) => {
      if (!ex || typeof ex !== "object") return null;
      const id = ex.examId?.toString() || ex.id?.toString();
      return id && id !== "null" && id !== "undefined" ? id : null;
    })
    .filter((id) => id !== null && id !== "");

  // Get available exams (not already added)
  const availableExams = (lookups?.exams || []).filter(
    (exam) => !userExamIds.includes(exam.id?.toString())
  );

  const availableExamOptions = [
    { value: "", label: "Sınav Seçiniz", disabled: true },
    ...availableExams.map((exam) => ({
      value: exam.id?.toString() || "",
      label: exam.name || "Bilinmeyen Sınav",
    })),
  ].filter((option) => option.value !== "" && option.label !== "");

  const getExamName = (exam, examId) => {
    // If exam object with name
    if (exam && typeof exam === "object" && exam.name) {
      return exam.name;
    }

    // Some APIs may nest exam info under exam.exam
    if (exam && typeof exam === "object" && exam.exam && exam.exam.name) {
      return exam.exam.name;
    }

    // Fallback to lookup by id
    if (examId && lookups?.exams) {
      const found = lookups.exams.find(
        (e) => e.id?.toString() === examId?.toString()
      );
      if (found && found.name) {
        return found.name;
      }
    }

    return "Bilinmeyen Sınav";
  };

  const handleAddExam = async () => {
    if (!selectedExamId) {
      showToast({
        type: "error",
        message: "Lütfen bir sınav seçin",
        duration: 3000,
      });
      return;
    }

    if (!examPoint) {
      showToast({
        type: "error",
        message: "Lütfen puan girin",
        duration: 3000,
      });
      return;
    }

    const pointNumber = parseFloat(examPoint);
    if (isNaN(pointNumber) || pointNumber < 0) {
      showToast({
        type: "error",
        message: "Geçerli bir puan girin",
        duration: 3000,
      });
      return;
    }

    if (!examAttemptDate) {
      showToast({
        type: "error",
        message: "Lütfen katılma tarihi seçin",
        duration: 3000,
      });
      return;
    }

    setAddingExam(true);
    const payload = {
      examId: parseInt(selectedExamId, 10),
      point: pointNumber,
      attemptDate: examAttemptDate,
    };

    const result = await onAddExam(payload);
    setAddingExam(false);
    setSelectedExamId("");
    setExamPoint("");
    setExamAttemptDate("");

    if (result.success) {
      showToast({
        type: "success",
        message: "Sınav başarıyla eklendi",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Sınav eklenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleRemoveExam = async (examId) => {
    setRemovingExamId(examId);
    const result = await onRemoveExam(examId);
    setRemovingExamId(null);

    if (result.success) {
      showToast({
        type: "success",
        message: "Sınav başarıyla kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Sınav kaldırılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Sınavlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Exam Form */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                label="Sınav Seçiniz"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                options={availableExamOptions}
                placeholder="Sınav seçiniz"
              />
              <Input
                label="Puan"
                type="number"
                value={examPoint}
                onChange={(e) => setExamPoint(e.target.value)}
                placeholder="Örneğin 450"
              />
              <Input
                label="Katılma Tarihi"
                type="date"
                max={today}
                value={examAttemptDate}
                onChange={(e) => {
                  const value = e.target.value;
                  // Ensure year is 4 digits max
                  if (value && value.length > 10) {
                    return; // Don't update if invalid
                  }
                  // Extract year from YYYY-MM-DD format
                  const yearMatch = value.match(/^(\d{4})/);
                  if (yearMatch && yearMatch[1] && yearMatch[1].length > 4) {
                    return; // Don't update if year is more than 4 digits
                  }
                  setExamAttemptDate(value);
                }}
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAddExam}
                disabled={addingExam || loading}
                className="min-w-[120px]"
              >
                {addingExam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Current Exams */}
          {user?.exams && user.exams.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eklenen Sınavlar
              </h3>
              <div className="space-y-3">
                {user.exams
                  .filter((exam) => {
                    if (!exam || typeof exam !== "object") return false;
                    const id = exam.examId?.toString() || exam.id?.toString();
                    return (
                      id &&
                      id !== "null" &&
                      id !== "undefined" &&
                      id.trim() !== ""
                    );
                  })
                  .map((exam) => {
                    const examId = (
                      exam.examId?.toString() ||
                      exam.id?.toString() ||
                      ""
                    ).trim();
                    const examName = getExamName(exam, examId);
                    const examPoint = exam.point || "-";
                    const attemptDate = exam.attemptDate
                      ? new Date(exam.attemptDate).toLocaleDateString("tr-TR")
                      : "-";
                    const isRemoving = removingExamId === examId;

                    if (!examId || examId === "") return null;

                    return (
                      <div
                        key={examId}
                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-semibold text-blue-900 dark:text-blue-300">
                              {examName}
                            </h4>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <p>
                              <span className="font-medium">Puan:</span>{" "}
                              {examPoint}
                            </p>
                            <p>
                              <span className="font-medium">Tarih:</span>{" "}
                              {attemptDate}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveExam(examId)}
                          disabled={isRemoving || loading}
                          className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2"
                          aria-label="Sınavı kaldır"
                        >
                          {isRemoving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Henüz sınav eklenmemiş. Yukarıdaki formdan sınav
                ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamsSection;
