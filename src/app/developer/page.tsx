import Link from "next/link";

export default function DeveloperPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Developer Portal
        </h1>
        <p className="text-gray-600">
          Pakia na usimamie apps zako kwenye Store Dutoza
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/developer/upload"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl mb-4">
            ⬆
          </div>
          <h2 className="font-semibold text-lg text-gray-900 mb-2">
            Pakia App Mpya
          </h2>
          <p className="text-gray-500 text-sm">
            Upload APK yako pamoja na maelezo na screenshots
          </p>
        </Link>

        <Link
          href="/developer/apps"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl mb-4">
            📱
          </div>
          <h2 className="font-semibold text-lg text-gray-900 mb-2">
            Apps Zangu
          </h2>
          <p className="text-gray-500 text-sm">
            Angalia na usimamie apps ulizopakia
          </p>
        </Link>
      </div>

      <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Maelekezo</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Hakikisha APK yako ni salama na haina virus</li>
          <li>• Andika description nzuri na weka screenshots</li>
          <li>• App itakaguliwa kabla ya kuonekana kwenye store</li>
          <li>• Unaweza ku-update version yoyote baadaye</li>
        </ul>
      </div>
    </div>
  );
}
