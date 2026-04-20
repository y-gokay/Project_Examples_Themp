# 🧩 Component Rehberi

Bu dokümantasyon, ATIM frontend projesinde kullanılan tüm UI component'lerinin kullanımını açıklar.

## 📋 İçindekiler

- [UI Components](#ui-components)
  - [Button](#button)
  - [Input](#input)
  - [Textarea](#textarea)
  - [Select](#select)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Modal](#modal)
  - [Card](#card)
  - [Badge](#badge)
  - [Avatar](#avatar)
  - [Dropdown](#dropdown)
  - [Pagination](#pagination)
  - [EmptyState](#emptystate)
  - [Loading States](#loading-states)
  - [RichTextEditor](#richtexteditor)
  - [Toast](#toast)
- [Common Components](#common-components)
  - [ErrorBoundary](#errorboundary)
  - [LoadingState](#loadingstate)
  - [Header](#header)
  - [Footer](#footer)
  - [Sidebar](#sidebar)
  - [ScrollToTop](#scrolltotop)

---

## 🎨 UI Components

### Button

Çok amaçlı buton component'i. Farklı variant'lar, boyutlar ve durumlar destekler.

**Import:**
```jsx
import { Button } from "../components/ui";
```

**Props:**
- `children` (React.ReactNode): Buton içeriği
- `variant` (string): `primary` | `secondary` | `outline` | `ghost` | `danger` (default: `primary`)
- `size` (string): `sm` | `md` | `lg` (default: `md`)
- `fullWidth` (boolean): Tam genişlik (default: `false`)
- `disabled` (boolean): Devre dışı durum (default: `false`)
- `loading` (boolean): Yükleniyor durumu (default: `false`)
- `leftIcon` (React.ReactNode): Sol tarafta icon
- `rightIcon` (React.ReactNode): Sağ tarafta icon
- `type` (string): Button type (`button` | `submit` | `reset`)
- `onClick` (Function): Tıklama handler'ı
- `ariaLabel` (string): Accessibility için label (icon-only button'lar için)
- `ariaDescribedBy` (string): Accessibility için açıklama ID'si

**Örnekler:**

```jsx
// Basit buton
<Button onClick={handleClick}>Kaydet</Button>

// Variant'lar
<Button variant="primary">Birincil</Button>
<Button variant="secondary">İkincil</Button>
<Button variant="outline">Çerçeveli</Button>
<Button variant="ghost">Görünmez</Button>
<Button variant="danger">Sil</Button>

// Boyutlar
<Button size="sm">Küçük</Button>
<Button size="md">Orta</Button>
<Button size="lg">Büyük</Button>

// Icon'lu buton
<Button leftIcon={<Save className="w-4 h-4" />}>Kaydet</Button>
<Button rightIcon={<ArrowRight className="w-4 h-4" />}>Devam Et</Button>

// Loading durumu
<Button loading={isLoading}>Gönder</Button>

// Tam genişlik
<Button fullWidth>Tam Genişlik</Button>

// Disabled
<Button disabled>Devre Dışı</Button>

// Icon-only (accessibility için ariaLabel gerekli)
<Button ariaLabel="Sil" onClick={handleDelete}>
  <Trash className="w-4 h-4" />
</Button>
```

---

### Input

Form input component'i. Label, error, helper text ve icon desteği içerir.

**Import:**
```jsx
import { Input } from "../components/ui";
```

**Props:**
- `label` (string): Input label'ı
- `error` (string): Hata mesajı
- `helperText` (string): Yardımcı metin
- `leftIcon` (React.ReactNode): Sol tarafta icon
- `rightIcon` (React.ReactNode): Sağ tarafta icon
- `required` (boolean): Zorunlu alan (default: `false`)
- `disabled` (boolean): Devre dışı durum (default: `false`)
- `size` (string): `sm` | `md` | `lg` (default: `md`)
- `id` (string): Input ID (otomatik oluşturulur)
- `...props`: Tüm standart input props'ları (`type`, `placeholder`, `value`, `onChange`, vb.)

**Özellikler:**
- Otomatik label-input bağlantısı (`htmlFor` ve `id`)
- ARIA attributes (accessibility)
- Error state'de kırmızı border ve mesaj
- Helper text desteği

**Örnekler:**

```jsx
// Basit input
<Input label="E-posta" type="email" placeholder="ornek@email.com" />

// Zorunlu alan
<Input label="Ad" required />

// Hata durumu
<Input
  label="Şifre"
  type="password"
  error="Şifre en az 8 karakter olmalıdır"
/>

// Helper text
<Input
  label="Telefon"
  helperText="0 5XX XXX XX XX formatında giriniz"
/>

// Icon'lu input
<Input
  label="Arama"
  leftIcon={<Search className="w-5 h-5" />}
  placeholder="Ara..."
/>

// Disabled
<Input label="Kullanıcı Adı" disabled value="mevcut_değer" />

// React Hook Form ile kullanım
const { register, formState: { errors } } = useForm();

<Input
  label="E-posta"
  type="email"
  {...register("email", { required: "E-posta zorunludur" })}
  error={errors.email?.message}
/>
```

---

### Textarea

Çok satırlı metin girişi için component.

**Import:**
```jsx
import { Textarea } from "../components/ui";
```

**Props:**
- `label` (string): Textarea label'ı
- `error` (string): Hata mesajı
- `helperText` (string): Yardımcı metin
- `required` (boolean): Zorunlu alan (default: `false`)
- `disabled` (boolean): Devre dışı durum (default: `false`)
- `rows` (number): Satır sayısı (default: `4`)
- `maxLength` (number): Maksimum karakter sayısı
- `showCount` (boolean): Karakter sayacı göster (default: `false`)
- `value` (string): Textarea değeri
- `id` (string): Textarea ID (otomatik oluşturulur)
- `...props`: Tüm standart textarea props'ları

**Örnekler:**

```jsx
// Basit textarea
<Textarea label="Açıklama" rows={5} />

// Karakter sayacı ile
<Textarea
  label="Mesaj"
  maxLength={500}
  showCount
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

// Hata durumu
<Textarea
  label="Açıklama"
  error="Açıklama en az 10 karakter olmalıdır"
/>
```

---

### Select

Dropdown select component'i.

**Import:**
```jsx
import { Select } from "../components/ui";
```

**Props:**
- `label` (string): Select label'ı
- `error` (string): Hata mesajı
- `helperText` (string): Yardımcı metin
- `options` (array): Seçenekler array'i `[{ value: string, label: string, disabled?: boolean }]`
- `placeholder` (string): Placeholder metni (default: `"Seçiniz"`)
- `required` (boolean): Zorunlu alan (default: `false`)
- `disabled` (boolean): Devre dışı durum (default: `false`)
- `id` (string): Select ID (otomatik oluşturulur)
- `...props`: Tüm standart select props'ları (`value`, `onChange`, vb.)

**Örnekler:**

```jsx
// Basit select
<Select
  label="Şehir"
  options={[
    { value: "istanbul", label: "İstanbul" },
    { value: "ankara", label: "Ankara" },
    { value: "izmir", label: "İzmir" },
  ]}
/>

// Placeholder ile
<Select
  label="İlçe"
  placeholder="İlçe seçiniz"
  options={districts}
/>

// Hata durumu
<Select
  label="Kategori"
  error="Kategori seçimi zorunludur"
  options={categories}
/>

// React Hook Form ile
<Select
  label="Şehir"
  {...register("city", { required: "Şehir seçimi zorunludur" })}
  error={errors.city?.message}
  options={cities}
/>
```

---

### Checkbox

Checkbox component'i. Label ve description desteği içerir.

**Import:**
```jsx
import { Checkbox } from "../components/ui";
```

**Props:**
- `label` (string): Checkbox label'ı
- `description` (string): Açıklama metni
- `error` (string): Hata mesajı
- `disabled` (boolean): Devre dışı durum (default: `false`)
- `checked` (boolean): Seçili durum
- `id` (string): Checkbox ID (otomatik oluşturulur)
- `...props`: Tüm standart checkbox props'ları (`onChange`, vb.)

**Örnekler:**

```jsx
// Basit checkbox
<Checkbox label="Kullanım şartlarını kabul ediyorum" />

// Description ile
<Checkbox
  label="E-posta bildirimleri"
  description="Yeni iş ilanları hakkında bilgilendirilmek istiyorum"
/>

// Kontrollü checkbox
<Checkbox
  label="Haber bülteni"
  checked={isSubscribed}
  onChange={(e) => setIsSubscribed(e.target.checked)}
/>

// Hata durumu
<Checkbox
  label="Kullanım şartları"
  error="Kullanım şartlarını kabul etmelisiniz"
/>
```

---

### Radio

Radio button component'i.

**Import:**
```jsx
import { Radio } from "../components/ui";
```

**Props:**
- `label` (string): Radio label'ı
- `description` (string): Açıklama metni
- `error` (string): Hata mesajı
- `disabled` (boolean): Devre dışı durum (default: `false`)
- `checked` (boolean): Seçili durum
- `id` (string): Radio ID (otomatik oluşturulur)
- `...props`: Tüm standart radio props'ları (`name`, `value`, `onChange`, vb.)

**Örnekler:**

```jsx
// Radio grup
<div>
  <Radio
    name="gender"
    value="male"
    label="Erkek"
    checked={gender === "male"}
    onChange={(e) => setGender(e.target.value)}
  />
  <Radio
    name="gender"
    value="female"
    label="Kadın"
    checked={gender === "female"}
    onChange={(e) => setGender(e.target.value)}
  />
</div>

// Description ile
<Radio
  name="experience"
  value="senior"
  label="Senior"
  description="5+ yıl deneyim"
/>
```

---

### Modal

Modal dialog component'i. Focus trap, ESC tuşu ve overlay click desteği içerir.

**Import:**
```jsx
import { Modal, ConfirmModal } from "../components/ui";
```

**Props:**
- `isOpen` (boolean): Modal açık mı?
- `onClose` (Function): Kapatma handler'ı
- `title` (string): Modal başlığı
- `children` (React.ReactNode): Modal içeriği
- `footer` (React.ReactNode): Modal footer'ı (genellikle butonlar)
- `size` (string): `sm` | `md` | `lg` | `xl` | `2xl` | `full` (default: `md`)
- `closeOnOverlayClick` (boolean): Overlay'e tıklayınca kapat (default: `true`)
- `showCloseButton` (boolean): Kapat butonu göster (default: `true`)
- `className` (string): Ek CSS class'ları

**Özellikler:**
- Focus trap (Tab tuşu ile focus içeride kalır)
- ESC tuşu ile kapatma
- Body scroll lock (mobil için)
- ARIA attributes (accessibility)

**Örnekler:**

```jsx
// Basit modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Başlık"
>
  <p>Modal içeriği</p>
</Modal>

// Footer ile
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Onay"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        İptal
      </Button>
      <Button onClick={handleConfirm}>Onayla</Button>
    </>
  }
>
  <p>Bu işlemi onaylıyor musunuz?</p>
</Modal>

// Farklı boyutlar
<Modal size="sm" title="Küçük Modal">...</Modal>
<Modal size="lg" title="Büyük Modal">...</Modal>
<Modal size="full" title="Tam Ekran">...</Modal>

// ConfirmModal (hazır component)
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Emin misiniz?"
  message="Bu işlem geri alınamaz."
  confirmText="Sil"
  cancelText="İptal"
  confirmVariant="danger"
/>
```

---

### Card

Kart component'i. Header, title, content ve footer bölümleri içerir.

**Import:**
```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui";
```

**Props:**
- `children` (React.ReactNode): Card içeriği
- `hoverable` (boolean): Hover efekti (default: `false`)
- `clickable` (boolean): Tıklanabilir cursor (default: `false`)
- `onClick` (Function): Tıklama handler'ı
- `padding` (string): `none` | `sm` | `md` | `lg` (default: `md`)
- `className` (string): Ek CSS class'ları

**Örnekler:**

```jsx
// Basit card
<Card>
  <CardHeader>
    <CardTitle>Başlık</CardTitle>
  </CardHeader>
  <CardContent>
    <p>İçerik</p>
  </CardContent>
  <CardFooter>
    <Button>Devam Et</Button>
  </CardFooter>
</Card>

// Hoverable card
<Card hoverable>
  <CardContent>Hover yapınca yükselir</CardContent>
</Card>

// Clickable card
<Card clickable onClick={handleClick}>
  <CardContent>Tıklanabilir kart</CardContent>
</Card>

// Padding seçenekleri
<Card padding="none">Padding yok</Card>
<Card padding="sm">Küçük padding</Card>
<Card padding="lg">Büyük padding</Card>
```

---

### Badge

Badge component'i. Durum göstergeleri için kullanılır.

**Import:**
```jsx
import { Badge } from "../components/ui";
```

**Props:**
- `children` (React.ReactNode): Badge içeriği
- `variant` (string): `default` | `primary` | `success` | `warning` | `danger` | `info` | `purple` (default: `default`)
- `size` (string): `sm` | `md` | `lg` (default: `md`)
- `dot` (boolean): Nokta göstergesi (default: `false`)
- `className` (string): Ek CSS class'ları

**Örnekler:**

```jsx
// Variant'lar
<Badge variant="default">Varsayılan</Badge>
<Badge variant="primary">Birincil</Badge>
<Badge variant="success">Başarılı</Badge>
<Badge variant="warning">Uyarı</Badge>
<Badge variant="danger">Tehlike</Badge>
<Badge variant="info">Bilgi</Badge>

// Dot ile
<Badge variant="success" dot>Aktif</Badge>

// Boyutlar
<Badge size="sm">Küçük</Badge>
<Badge size="md">Orta</Badge>
<Badge size="lg">Büyük</Badge>
```

---

### Avatar

Avatar component'i. Resim, initials veya icon fallback desteği içerir.

**Import:**
```jsx
import { Avatar, AvatarGroup } from "../components/ui";
```

**Props:**
- `src` (string): Resim URL'i
- `alt` (string): Alt text
- `name` (string): İsim (initials için)
- `size` (string): `xs` | `sm` | `md` | `lg` | `xl` | `2xl` (default: `md`)
- `rounded` (boolean): Yuvarlak stil (default: `true`)
- `className` (string): Ek CSS class'ları

**Örnekler:**

```jsx
// Resim ile
<Avatar src="/avatar.jpg" alt="Kullanıcı" />

// İsim ile (initials)
<Avatar name="Ahmet Yılmaz" />

// Boyutlar
<Avatar size="sm" name="Kullanıcı" />
<Avatar size="md" name="Kullanıcı" />
<Avatar size="lg" name="Kullanıcı" />

// Avatar Group
<AvatarGroup max={4}>
  <Avatar name="Ahmet" />
  <Avatar name="Mehmet" />
  <Avatar name="Ayşe" />
  <Avatar name="Fatma" />
  <Avatar name="Ali" /> {/* +1 olarak gösterilir */}
</AvatarGroup>
```

---

### Dropdown

Dropdown menu component'i. Keyboard navigation desteği içerir.

**Import:**
```jsx
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from "../components/ui";
```

**Props (Dropdown):**
- `trigger` (React.ReactNode): Dropdown'u açan element
- `children` (React.ReactNode): Dropdown içeriği
- `align` (string): `left` | `right` | `center` (default: `left`)
- `ariaLabel` (string): Accessibility için label
- `className` (string): Ek CSS class'ları

**Props (DropdownItem):**
- `children` (React.ReactNode): Item içeriği
- `icon` (React.ReactNode): Sol tarafta icon
- `onClick` (Function): Tıklama handler'ı
- `href` (string): Link URL'i (link olarak render edilir)
- `danger` (boolean): Tehlikeli işlem (kırmızı renk)
- `disabled` (boolean): Devre dışı durum
- `ariaLabel` (string): Accessibility için label

**Özellikler:**
- Keyboard navigation (Arrow keys, Enter, Escape)
- Outside click ile kapatma
- ESC tuşu ile kapatma

**Örnekler:**

```jsx
// Basit dropdown
<Dropdown
  trigger={<Button>Menü</Button>}
  ariaLabel="Kullanıcı menüsü"
>
  <DropdownItem onClick={handleProfile}>Profil</DropdownItem>
  <DropdownItem onClick={handleSettings}>Ayarlar</DropdownItem>
  <DropdownDivider />
  <DropdownItem onClick={handleLogout} danger>
    Çıkış
  </DropdownItem>
</Dropdown>

// Icon'lu items
<Dropdown trigger={<Button>İşlemler</Button>}>
  <DropdownItem icon={<Edit className="w-4 h-4" />} onClick={handleEdit}>
    Düzenle
  </DropdownItem>
  <DropdownItem icon={<Trash className="w-4 h-4" />} onClick={handleDelete} danger>
    Sil
  </DropdownItem>
</Dropdown>

// Link items
<Dropdown trigger={<Button>Navigasyon</Button>}>
  <DropdownItem href="/profil">Profil</DropdownItem>
  <DropdownItem href="/ayarlar">Ayarlar</DropdownItem>
</Dropdown>

// Label ve divider
<Dropdown trigger={<Button>Menü</Button>}>
  <DropdownLabel>Hesap</DropdownLabel>
  <DropdownItem>Profil</DropdownItem>
  <DropdownItem>Ayarlar</DropdownItem>
  <DropdownDivider />
  <DropdownLabel>Diğer</DropdownLabel>
  <DropdownItem>Yardım</DropdownItem>
</Dropdown>
```

---

### Pagination

Sayfalama component'i.

**Import:**
```jsx
import { Pagination } from "../components/ui";
```

**Props:**
- `currentPage` (number): Mevcut sayfa (1-based, default: `1`)
- `totalPages` (number): Toplam sayfa sayısı
- `onPageChange` (Function): Sayfa değişim handler'ı `(page: number) => void`
- `showPageNumbers` (boolean): Sayfa numaralarını göster (default: `true`)
- `maxVisible` (number): Maksimum görünür sayfa butonu (default: `5`)
- `className` (string): Ek CSS class'ları

**Örnekler:**

```jsx
// Basit pagination
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => setCurrentPage(page)}
/>

// Az sayfa göster
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  maxVisible={3}
/>

// Sadece önceki/sonraki butonları
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  showPageNumbers={false}
/>
```

---

### EmptyState

Boş durum component'i. Liste boş olduğunda gösterilir.

**Import:**
```jsx
import { EmptyState } from "../components/ui";
```

**Props:**
- `icon` (React.ReactNode): Custom icon (default: Inbox icon)
- `title` (string): Başlık (default: `"Henüz içerik yok"`)
- `description` (string): Açıklama metni
- `action` (React.ReactNode): Aksiyon butonu/içeriği
- `className` (string): Ek CSS class'ları

**Örnekler:**

```jsx
// Basit empty state
<EmptyState
  title="Henüz ilan yok"
  description="Henüz hiç ilan eklenmemiş."
/>

// Custom icon ve action ile
<EmptyState
  icon={<Briefcase className="w-12 h-12 text-gray-400" />}
  title="İlan bulunamadı"
  description="Arama kriterlerinize uygun ilan bulunamadı."
  action={
    <Button onClick={handleResetFilters}>Filtreleri Temizle</Button>
  }
/>
```

---

### Loading States

Loading state component'leri. Farklı durumlar için farklı component'ler.

**Import:**
```jsx
import { PageLoading, InlineLoading, ButtonLoading, LoadingState } from "../components/common";
```

**PageLoading:**
- Sayfa yüklenirken gösterilir
- Props: `text` (string, default: `"Sayfa yükleniyor..."`)

**InlineLoading:**
- İçerik yüklenirken gösterilir (örneğin tablo içinde)
- Props: `text` (string, default: `"Yükleniyor..."`)

**ButtonLoading:**
- Buton içinde gösterilir
- Props: `size` (string: `"sm"` | `"md"`, default: `"sm"`)

**LoadingState:**
- Özelleştirilebilir loading state
- Props:
  - `text` (string, default: `"Yükleniyor..."`)
  - `size` (string: `"sm"` | `"md"` | `"lg"` | `"xl"`, default: `"md"`)
  - `fullScreen` (boolean, default: `false`)
  - `className` (string)
  - `children` (React.ReactNode): Custom içerik

**Örnekler:**

```jsx
// Sayfa loading
{isLoading && <PageLoading text="İlanlar yükleniyor..." />}

// Inline loading
{isLoading ? (
  <InlineLoading text="Veriler yükleniyor..." />
) : (
  <Table data={data} />
)}

// Button loading (Button component'i zaten loading prop'u var)
<Button loading={isSubmitting}>Gönder</Button>

// Custom loading state
<LoadingState
  text="İşlem yapılıyor..."
  size="lg"
  fullScreen={true}
/>
```

---

### RichTextEditor

Zengin metin editörü (TipTap tabanlı).

**Import:**
```jsx
import { RichTextEditor } from "../components/ui";
```

**Props:**
- `value` (string): HTML içeriği
- `onChange` (Function): Değişim handler'ı `(event: { target: { name: string, value: string } }) => void`
- `name` (string): Field name (form için)
- `placeholder` (string): Placeholder metni
- `disabled` (boolean): Devre dışı durum
- `error` (string): Hata mesajı
- `id` (string): Editor ID (otomatik oluşturulur)

**Özellikler:**
- Başlık seviyeleri (H1, H2, H3)
- Metin formatlama (kalın, italik, alt çizgi)
- Renk seçimi
- Link ekleme
- Metin hizalama

**Örnekler:**

```jsx
// Basit kullanım
<RichTextEditor
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Açıklama yazın..."
/>

// Form ile
<RichTextEditor
  name="postDescription"
  value={formData.postDescription}
  onChange={handleChange}
  error={errors.postDescription}
/>

// Disabled
<RichTextEditor
  value={content}
  disabled
/>
```

---

### Toast

Toast notification sistemi. Global bildirimler için kullanılır.

**Import:**
```jsx
import { showToast, ToastContainer } from "../components/ui";
```

**showToast Fonksiyonu:**
```jsx
showToast({
  type: "success" | "error" | "warning" | "info",
  title: string, // Opsiyonel
  message: string,
  duration: number, // ms (0 = otomatik kapanmaz, default: 5000)
});
```

**ToastContainer:**
- `App.jsx` içinde zaten eklenmiş
- Ayrıca eklemeye gerek yok

**Örnekler:**

```jsx
// Başarı mesajı
showToast({
  type: "success",
  title: "Başarılı",
  message: "İlan başarıyla oluşturuldu.",
});

// Hata mesajı
showToast({
  type: "error",
  title: "Hata",
  message: "Bir hata oluştu. Lütfen tekrar deneyin.",
});

// Uyarı mesajı
showToast({
  type: "warning",
  message: "Bu işlem geri alınamaz.",
});

// Bilgi mesajı
showToast({
  type: "info",
  message: "Yeni özellikler eklendi.",
});

// Otomatik kapanmayan toast
showToast({
  type: "error",
  message: "Kritik hata!",
  duration: 0, // Otomatik kapanmaz
});
```

---

## 🔧 Common Components

### ErrorBoundary

React hatalarını yakalayan error boundary component'i.

**Import:**
```jsx
import { ErrorBoundary } from "../components/common";
```

**Kullanım:**
- `App.jsx` içinde zaten eklenmiş
- Tüm uygulamayı sarar
- Hata durumunda kullanıcı dostu mesaj gösterir

**Özelleştirme:**
- `src/components/common/ErrorBoundary.jsx` dosyasını düzenleyin

---

### LoadingState

Standart loading state component'leri (yukarıda açıklandı).

---

### Header

Ana navigasyon header'ı.

**Import:**
```jsx
import Header from "../components/common/Header";
```

**Kullanım:**
- Layout'larda otomatik kullanılıyor
- Responsive tasarım
- Mobile menu desteği
- Kullanıcı menüsü

---

### Footer

Sayfa alt bilgisi footer'ı.

**Import:**
```jsx
import Footer from "../components/common/Footer";
```

**Kullanım:**
- Layout'larda otomatik kullanılıyor
- İletişim bilgileri
- Sosyal medya linkleri

---

### Sidebar

Dashboard sidebar'ı.

**Import:**
```jsx
import Sidebar from "../components/common/Sidebar";
```

**Kullanım:**
- DashboardLayout'ta otomatik kullanılıyor
- Navigasyon menüsü
- Kullanıcı bilgileri

---

### ScrollToTop

Sayfa değiştiğinde en üste scroll yapan component.

**Import:**
```jsx
import { ScrollToTop } from "../components/common";
```

**Kullanım:**
- `App.jsx` içinde zaten eklenmiş
- Route değişimlerinde otomatik çalışır

---

## 📚 Best Practices

### 1. Form Component'leri

Form component'lerini React Hook Form ile kullanın:

```jsx
const { register, formState: { errors } } = useForm();

<Input
  label="E-posta"
  {...register("email", { required: "E-posta zorunludur" })}
  error={errors.email?.message}
/>
```

### 2. Accessibility

- Icon-only button'lar için `ariaLabel` kullanın
- Form field'lar için `label` prop'unu kullanın
- Error mesajları otomatik olarak ARIA ile bağlanır

### 3. Loading States

- Sayfa yüklenirken: `PageLoading`
- İçerik yüklenirken: `InlineLoading`
- Buton yüklenirken: `Button` component'inin `loading` prop'u

### 4. Error Handling

- Form hataları: Component'in `error` prop'u
- API hataları: `showToast` ile gösterin
- React hataları: `ErrorBoundary` yakalar

### 5. Responsive Design

- Tüm component'ler responsive
- Mobile-first yaklaşım
- Tailwind CSS breakpoint'leri kullanılır

---

## 🔗 İlgili Dokümantasyon

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Mimari açıklamaları
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Başlangıç rehberi

---

**Son Güncelleme:** 2025-01-27  

