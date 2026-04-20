const BusinessDetailModal = ({ business, onClose, onApprove, onReject, actionLoading }) => {
  if (!business) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">İşletme Detayları</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">İşletme Adı</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Vergi No</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.vergiNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">E-posta</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.businessEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Telefon</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.businessContactPhoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Adres</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Çalışan Sayısı</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.workerCount}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Açıklama</p>
              <p className="text-sm text-gray-900 dark:text-white">{business.description}</p>
            </div>
          )}

          {/* Sectors */}
          {business.sectors && business.sectors.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">Sektörler</p>
              <div className="flex flex-wrap gap-2">
                {business.sectors.map((sectorItem) => (
                  <span
                    key={sectorItem.id}
                    className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-orange-900/30 dark:text-orange-200 rounded-full text-sm"
                  >
                    {sectorItem.sector.sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Accounts */}
          {business.accounts && business.accounts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hesaplar</h3>
              <div className="space-y-3">
                {business.accounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Ad Soyad</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{account.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Rol</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{account.role?.role || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">E-posta</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{account.email}</p>
                      </div>
                      {account.phoneNumber && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Telefon</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{account.phoneNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Durum Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Durum</p>
                {business.isApproved === true ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full text-xs font-semibold">
                    Onaylandı
                  </span>
                ) : business.isApproved === false ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded-full text-xs font-semibold">
                    Reddedildi
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 rounded-full text-xs font-semibold">
                    Beklemede
                  </span>
                )}
              </div>
              {business.reviewDate && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">İnceleme Tarihi</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(business.reviewDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              {business.reviewedByAdmin && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">İnceleyen Admin</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {business.reviewedByAdmin.name} {business.reviewedByAdmin.surname}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Kapat
          </button>
          {business.isApproved === null && (
            <>
              <button
                onClick={() => onReject(business.id)}
                disabled={actionLoading[business.id] === 'reject'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading[business.id] === 'reject' ? 'Reddediliyor...' : 'Reddet'}
              </button>
              <button
                onClick={() => onApprove(business.id)}
                disabled={actionLoading[business.id] === 'approve'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading[business.id] === 'approve' ? 'Onaylanıyor...' : 'Onayla'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailModal;

