import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
        Masharti ya Matumizi
      </h1>
      <p className="text-gray-500 text-xs mb-5">
        Terms of Service — Store Dutoza
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4 text-xs text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">1. Kukubali</h2>
          <p>
            Kwa kutumia Store Dutoza (&quot;Huduma&quot;), unakubali masharti haya.
            Ikiwa hukubaliani, usitumie huduma hii.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            2. Akaunti yako
          </h2>
          <p>
            Unawajibika kulinda password yako na shughuli zote zinazofanyika
            chini ya akaunti yako. Toa taarifa sahihi wakati wa kusajili.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            3. Apps na maudhui
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Developers wanawajibika kwa APK, maelezo, na screenshots
              wanazopakia.
            </li>
            <li>
              Ni marufuku kupakia malware, virus, au maudhui haramu.
            </li>
            <li>
              Store Dutoza inaweza kukataa, kuzuia (block), au kufuta app yoyote
              bila notisi ya awali.
            </li>
            <li>
              Kupakua apps ni kwa hatari yako mwenyewe; hakikisha unajua
              developer.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            4. Matumizi yaliyokatazwa
          </h2>
          <p>
            Usitumie huduma kwa udanganyifu, uvunjaji wa sheria, kuingilia
            mifumo, au kudhuru watumiaji wengine.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            5. Haki za milki
          </h2>
          <p>
            Apps na maudhui ni mali ya developers husika. Store Dutoza ni jukwaa
            la usambazaji tu.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            6. Kukomesha akaunti
          </h2>
          <p>
            Unaweza kufuta akaunti yako kupitia Settings. Tunaweza kusitisha
            akaunti inayovunja masharti.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">
            7. Mabadiliko
          </h2>
          <p>
            Tunaweza kubadilisha masharti haya. Matumizi endelevu yanamaanisha
            unakubali toleo jipya.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-sm mb-1">8. Mawasiliano</h2>
          <p>
            Maswali kuhusu masharti: wasiliana na wasimamizi wa Store Dutoza.
          </p>
        </section>

        <p className="text-gray-400 text-[10px] pt-2 border-t border-gray-100">
          Ilisasishwa: Oktoba 2026
        </p>
      </div>

      <p className="mt-4 text-center">
        <Link href="/privacy" className="text-blue-600 text-xs hover:underline">
          Sera ya Faragha →
        </Link>
      </p>
    </div>
  );
}
