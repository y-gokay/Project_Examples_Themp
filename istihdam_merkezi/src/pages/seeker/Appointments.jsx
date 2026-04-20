import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import {
  Card,
  CardContent,
  Button,
  Badge,
  EmptyState,
  Loading,
  Select,
} from "../../components/ui";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { APPOINTMENT_STATUS_LABELS } from "../../constants";

const Appointments = () => {
  const { getAppointments, loading } = useAppStore();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter]);

  const loadAppointments = async () => {
    const result = await getAppointments();
    if (result.success) {
      setAppointments(result.data?.items || result.data || []);
    }
  };

  const filterAppointments = () => {
    if (statusFilter === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((apt) => apt.status === statusFilter)
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      case "completed":
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && appointments.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Randevularım</h1>
          <p className="text-gray-600">
            Kariyer danışmanları ile randevularınızı buradan yönetebilirsiniz
          </p>
        </div>

        {/* Filter */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Tüm Randevular" },
                { value: "confirmed", label: "Onaylanmış" },
                { value: "completed", label: "Tamamlanmış" },
                { value: "cancelled", label: "İptal Edilmiş" },
              ]}
              className="min-w-[200px]"
            />
          </div>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const StatusIcon = getStatusIcon(appointment.status);
              return (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {appointment.advisorName}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {APPOINTMENT_STATUS_LABELS[appointment.status] ||
                                appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {appointment.advisorTitle}
                          </p>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {formatDate(appointment.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>
                                {appointment.time} ({appointment.duration} dakika)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{appointment.location}</span>
                            </div>
                            {appointment.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Not: </span>
                                  {appointment.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a
                          href={`tel:${appointment.advisorPhone}`}
                          className="hover:text-blue-600"
                        >
                          {appointment.advisorPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${appointment.advisorEmail}`}
                          className="hover:text-blue-600"
                        >
                          {appointment.advisorEmail}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-gray-400" />}
            title="Henüz randevunuz yok"
            description="Kariyer danışmanları ile randevu almak için danışmanlar sayfasını ziyaret edin"
            action={
              <a href="/danismanlar">
                <Button>
                  Danışmanları Görüntüle
                </Button>
              </a>
            }
          />
        )}
      </div>
    </div>
  );
};

export default Appointments;

