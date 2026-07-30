# Admin üye yönetimi kurulumu

Bu kurulum yalnızca bir kez yapılır.

## 1. SQL kodunu çalıştır

Supabase panelinde **SQL Editor > New query** bölümünü aç.
`supabase/admin-members.sql` dosyasındaki kodun tamamını yapıştırıp **Run** düğmesine bas.

## 2. Yönetici e-postasını tanımla

Supabase panelinde **Edge Functions > Secrets** bölümüne gir ve şu değeri ekle:

- Ad: `ADMIN_EMAIL`
- Değer: `nirem587@gmail.com`

`SUPABASE_URL`, `SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` Supabase tarafından Edge Function'a otomatik sağlanır. Service role anahtarını React projesine veya `.env` dosyasına ekleme.

## 3. Edge Function'ı yayımla

GitHub deposunun ana klasöründe terminal aç:

```bash
npx supabase login
npx supabase link --project-ref PROJE_REF
npx supabase functions deploy admin-users
```

`PROJE_REF`, Supabase proje adresindeki şu bölümdür:
`https://PROJE_REF.supabase.co`

## 4. Siteyi güncelle

Yeni `src` klasörünü projeye kopyala, ardından:

```bash
npm run build
```

Bu projedeki Supabase Dashboard fonksiyon adı `hyper-responder` olarak oluşturuldu.
Admin hesabınla giriş yaptığında **Admin > Üyeler** ekranı açılır.

## Güvenlik

- Normal üyeler fonksiyonu çağıramaz.
- Yönetici kendi hesabını pasife alamaz veya silemez.
- Pasife alınan kullanıcı giriş yapamaz.
- Silme işlemi hesabı erişime kapatır ve profil bilgisini anonimleştirir.
- Eski sipariş kayıtları işletme geçmişi için korunur.
