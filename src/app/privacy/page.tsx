import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
        Sera ya Faragha
      </h1>
      <p className="text-gray-500 text-xs mb-5">
        Privacy Policy — Store Dutoza
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4 text-xs text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            1. Taarifa tunazokusanya
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>Email, jina, na username unaposajili.</li>
            <li>
              Maelezo ya apps unazopakia (jina, description, APK, icons,
              screenshots).
            </li>
            <li>
              Takwimu za matumizi kama downloads na ratings (kwa kuboresha
              huduma).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            2. Jinsi tunavyotumia
          </h2>
          <p>
            Tunatumia taarifa kuendesha store, kuthibitisha akaunti, kuonyesha
            apps, na kuboresha uzoefu. Hatuziuuzi kwa wahusika wa tatu kwa
            madhumuni ya kibiashara.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            3. Uhifadhi na usalama
          </h2>
          <p>
            Data huhifadhiwa kupitia Supabase. Tunatumia mbinu za kawaida za
            usalama, lakini hakuna mfumo ulio salama 100%. Linda password yako.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            4. Kushiriki data
          </h2>
          <p>
            Tunaweza kushiriki data inapohitajika kisheria, au kwa watoa huduma
            wa kiufundi (hosting, auth) wanaosaidia kuendesha Store Dutoza.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">5. Haki zako</h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>Unaweza kusasisha wasifu kupitia Settings.</li>
            <li>Unaweza kuomba kufuta akaunti (Settings → Futa Akaunti).</li>
            <li>
              Baada ya kufuta, apps na wasifu wako huondolewa kwenye store
              kulingana na uwezo wa mfumo.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">6. Cookies</h2>
          <p>
            Tunatumia cookies/session kwa login na usalama wa akaunti. Si kwa
            matangazo ya wahusika wa tatu.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">7. Watoto</h2>
          <p>
            Huduma haikulengwa watoto chini ya miaka 13. Hatukusanyi taarifa kwa
            makusudi kutoka kwa watoto.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            8. Mabadiliko ya sera
          </h2>
          <p>
            Tunaweza kusasisha sera hii. Tarehe ya sasisho itaonyeshwa chini ya
            ukurasa.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">9. Mawasiliano</h2>
          <p>
            Maswali kuhusu faragha: wasiliana na wasimamizi wa Store Dutoza.
          </p>
        </section>

        <p className="text-gray-400 text-[10px] pt-2 border-t border-gray-100">
          Ilisasishwa: Oktoba 2026
        </p>
      </div>

      <p className="mt-4 text-center">
        <Link href="/terms" className="text-blue-600 text-xs hover:underline">
          ← Masharti ya Matumizi
        </Link>
      </p>
    </div>
  );
}
