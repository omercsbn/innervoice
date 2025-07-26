import NoteInput from '@/components/NoteInput';
import NotesList from '@/components/NotesList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🧘‍♂️ InnerVoice
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Kişisel Duygu Analizi ve İçsel Diyalog Asistanı
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <NoteInput />
          </div>
          
          <div>
            <NotesList />
          </div>
        </div>
      </div>
    </div>
  );
}
