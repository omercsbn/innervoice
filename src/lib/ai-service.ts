import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysis, UserProfile, Note } from '@/types';

export class AIService {
  private static instance: AIService;
  private genAI: GoogleGenerativeAI;
  
  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeNote(content: string, userProfile?: UserProfile, previousNotes?: Note[]): Promise<AIAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = this.buildAnalysisPrompt(content, userProfile, previousNotes);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text, content);
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to mock analysis if API fails
      return this.generateMockAnalysis(content, userProfile);
    }
  }

  private buildAnalysisPrompt(content: string, userProfile?: UserProfile, previousNotes?: Note[]): string {
    const mode = userProfile?.mode || 'friend';
    const name = userProfile?.name || 'Kullanıcı';
    const age = userProfile?.age;
    
    // Get user interests and personality from localStorage if available
    let interestsStr = '';
    let personalityStr = '';
    
    if (typeof window !== 'undefined') {
      try {
        const profileData = localStorage.getItem('innervoice_profile');
        if (profileData) {
          const profile = JSON.parse(profileData);
          if (profile.interests?.length > 0) {
            interestsStr = `\n- İlgi Alanları: ${profile.interests.join(', ')}`;
          }
          if (profile.personalityTraits?.length > 0) {
            personalityStr = `\n- Kişilik Özellikleri: ${profile.personalityTraits.join(', ')}`;
          }
        }
      } catch (error) {
        console.log('Could not parse user profile from localStorage');
      }
    }

    // Analyze previous notes for context
    let contextStr = '';
    let emotionalPatterns = '';
    
    if (previousNotes && previousNotes.length > 0) {
      // Get recent notes (last 5)
      const recentNotes = previousNotes.slice(0, 5);
      
      // Extract emotional patterns
      const emotions = recentNotes
        .map(note => note.tags)
        .flat()
        .filter((emotion): emotion is string => Boolean(emotion));
      
      const emotionCounts = emotions.reduce((acc: Record<string, number>, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});
      
      const topEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([emotion]) => emotion);

      if (topEmotions.length > 0) {
        emotionalPatterns = `\n- Son dönem hakim duygular: ${topEmotions.join(', ')}`;
      }

      // Get context from recent notes
      const recentContext = recentNotes
        .map((note, index) => {
          const daysDiff = Math.floor((Date.now() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          const timeRef = daysDiff === 0 ? 'bugün' : daysDiff === 1 ? 'dün' : `${daysDiff} gün önce`;
          return `${timeRef}: "${note.content.slice(0, 100)}${note.content.length > 100 ? '...' : ''}"`;
        })
        .join('\n');

      contextStr = `\nSON NOTLAR VE DUYGUSAL GEÇMİŞ:
${recentContext}${emotionalPatterns}`;
    }
    
    return `
Sen InnerVoice adlı kişisel günlük asistanısın. Amacın kullanıcıyla konuşan bir iç ses gibi davranmak.
Empati kur, anlamaya çalış, yargılama ve öğüt verme tonuna kaçma.
Kullanıcının geçmiş notlarını ve duygusal geçmişini dikkate alarak bağlamsal yanıtlar ver.

KULLANICI PROFİLİ:
- Adı: ${name}${age ? `\n- Yaş: ${age}` : ''}${interestsStr}${personalityStr}
- İçsel Diyalog Modu: ${mode} (therapy=terapi, mentor=mentor, friend=dost, humorous=mizahi)${contextStr}

BUGÜNKÜ GÜNLÜK GİRDİSİ:
"${content}"

${mode === 'therapy' ? `
Terapi modunda ol: Anlayışlı, destekleyici ve profesyonel yaklaş. Duygusal güvenlik hissi ver.
Geçmiş notlarında gördüğün kalıpları nazikçe işaret et.
` : mode === 'mentor' ? `
Mentor modunda ol: Yönlendirici, bilge ve deneyimli yaklaş. Öğretici tavır sergi.
Geçmiş deneyimlerinden öğrenmesine yardım et.
` : mode === 'humorous' ? `
Eğlenceli modunda ol: Mizahi, neşeli ve rahatlatıcı yaklaş. Uygun yerlerde şakacı ol.
Geçmiş notlarındaki pozitif yanları vurgula.
` : `
Arkadaş modunda ol: Samimi, rahat ve destekleyici yaklaş. Sıcak ve anlayışlı ol.
Geçmiş paylaşımlarını hatırlayarak bağlantı kur.
`}

ÖZEL TALİMATLAR:
- Eğer bugünkü not geçmiş notlarla benzer duygular içeriyorsa, bu bağlantıyı nazikçe belirt
- Duygusal gelişim veya değişim varsa bunu övgüyle karşıla
- Tekrarlayan kalıplar varsa yapıcı şekilde fark ettir
- ${name} ismini kullanarak kişisel hitap et
- Geçmiş bağlamı dikkate alarak daha derin içgörüler sun

Lütfen aşağıdaki formatta yanıtla (her bölümü ayrı satırda):

EMOTIONAL_TONE: [Duygusal tonu kısa tanımla - örn: "Pozitif ve umutlu", "Hüzünlü ve düşünceli"]
EMOTIONS: [Ana duyguları virgülle ayırarak listele - örn: "mutlu,umutlu" veya "üzgün,yalnız,endişeli"]
MOOD_SCORE: [Ruh hali skoru -5 ile +5 arasında sayı - örn: 2 veya -3]
REFLECTION: [1-2 cümlelik kısa yansıtma, geçmiş bağlamını da dikkate alarak]
RESPONSE: [Kullanıcıya ${mode} modunda tepki/cevap, ${name} ismiyle hitap ederek, geçmiş notlarla bağlantı kurarak]
QUESTION: [İsteğe bağlı - kullanıcıyı derinleştiren bir soru, geçmiş deneyimlerini de dikkate alarak]
COUNTER_NOTE: [İsteğe bağlı - alternatif bakış açısı]
SUGGESTION: [İsteğe bağlı - yapıcı öneri, kişilik özelliklerine uygun]
MOTIVATION: [Kısa motivasyon cümlesi]

Türkçe yanıtla ve samimi, anlayışlı bir ton kullan. Kullanıcının geçmişini hatırlayarak daha kişisel ve değerli bir deneyim sun.
`;
  }

  private parseGeminiResponse(text: string, originalContent: string): AIAnalysis {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      const parsed: Partial<AIAnalysis> = {};
      
      for (const line of lines) {
        if (line.startsWith('EMOTIONAL_TONE:')) {
          parsed.emotionalTone = line.replace('EMOTIONAL_TONE:', '').trim();
        } else if (line.startsWith('EMOTIONS:')) {
          const emotionsStr = line.replace('EMOTIONS:', '').trim();
          parsed.mainEmotions = emotionsStr.split(',').map(e => e.trim()).filter(e => e);
        } else if (line.startsWith('MOOD_SCORE:')) {
          const scoreStr = line.replace('MOOD_SCORE:', '').trim();
          parsed.moodScore = parseInt(scoreStr) || 0;
        } else if (line.startsWith('REFLECTION:')) {
          parsed.reflection = line.replace('REFLECTION:', '').trim();
        } else if (line.startsWith('RESPONSE:')) {
          parsed.response = line.replace('RESPONSE:', '').trim();
        } else if (line.startsWith('QUESTION:')) {
          const question = line.replace('QUESTION:', '').trim();
          if (question && question !== '-' && question !== 'Yok') {
            parsed.question = question;
          }
        } else if (line.startsWith('COUNTER_NOTE:')) {
          const counterNote = line.replace('COUNTER_NOTE:', '').trim();
          if (counterNote && counterNote !== '-' && counterNote !== 'Yok') {
            parsed.counterNote = counterNote;
          }
        } else if (line.startsWith('SUGGESTION:')) {
          const suggestion = line.replace('SUGGESTION:', '').trim();
          if (suggestion && suggestion !== '-' && suggestion !== 'Yok') {
            parsed.suggestion = suggestion;
          }
        } else if (line.startsWith('MOTIVATION:')) {
          parsed.motivation = line.replace('MOTIVATION:', '').trim();
        }
      }
      
      // Fallback values if parsing failed
      return {
        emotionalTone: parsed.emotionalTone || 'Nötr',
        mainEmotions: parsed.mainEmotions || ['nötr'],
        moodScore: parsed.moodScore || 0,
        reflection: parsed.reflection || 'Düşüncelerini paylaştığın için teşekkürler.',
        response: parsed.response || 'Anlıyorum. Her duygu önemli ve değerli.',
        question: parsed.question,
        counterNote: parsed.counterNote,
        suggestion: parsed.suggestion,
        motivation: parsed.motivation || 'Her not bir adım, her adım bir gelişim.'
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.generateMockAnalysis(originalContent);
    }
  }

  private getMoodEmoji(moodScore?: number): string {
    if (!moodScore) return '😐';
    if (moodScore >= 3) return '😄';
    if (moodScore >= 1) return '😊';
    if (moodScore >= 0) return '😐';
    if (moodScore >= -2) return '😔';
    return '😢';
  }

  private generateMockAnalysis(content: string, userProfile?: UserProfile): AIAnalysis {
    const lowercaseContent = content.toLowerCase();
    
    // Simple emotion detection based on keywords
    const emotionKeywords = {
      happy: ['mutlu', 'sevinç', 'güzel', 'harika', 'mükemmel', 'keyif', 'eğlence'],
      sad: ['üzgün', 'kötü', 'ağlamak', 'hüzün', 'üzüntü', 'melankolik'],
      angry: ['sinir', 'kızgın', 'öfke', 'bıkkın', 'rahatsız'],
      anxious: ['endişe', 'kaygı', 'stres', 'gergin', 'tedirgin'],
      lonely: ['yalnız', 'tek', 'kimse', 'boş'],
      hopeful: ['umut', 'gelecek', 'başarı', 'hedef', 'hayal']
    };

    const detectedEmotions: string[] = [];
    let moodScore = 0;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowercaseContent.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions.push(emotion);
        // Adjust mood score based on emotion
        switch (emotion) {
          case 'happy':
          case 'hopeful':
            moodScore += 2;
            break;
          case 'sad':
          case 'lonely':
            moodScore -= 2;
            break;
          case 'angry':
          case 'anxious':
            moodScore -= 1;
            break;
        }
      }
    });

    // Default emotions if none detected
    if (detectedEmotions.length === 0) {
      detectedEmotions.push('nötr');
    }

    // Clamp mood score between -5 and 5
    moodScore = Math.max(-5, Math.min(5, moodScore));

    const emotionalTone = this.getEmotionalTone(detectedEmotions, moodScore);
    const reflection = this.generateReflection(content, detectedEmotions);
    const response = this.generateResponse(content, detectedEmotions, userProfile);
    const question = this.generateQuestion(detectedEmotions);
    const counterNote = this.generateCounterNote(detectedEmotions);
    const suggestion = this.generateSuggestion(detectedEmotions);
    const motivation = this.generateMotivation();

    return {
      emotionalTone,
      mainEmotions: detectedEmotions,
      moodScore,
      reflection,
      response,
      question,
      counterNote,
      suggestion,
      motivation
    };
  }

  private getEmotionalTone(emotions: string[], moodScore: number): string {
    if (moodScore >= 2) return 'Pozitif ve umutlu';
    if (moodScore <= -2) return 'Olumsuz ve hüzünlü';
    if (emotions.includes('anxious')) return 'Endişeli ve gergin';
    if (emotions.includes('lonely')) return 'Yalnız ve içe dönük';
    return 'Nötr ve dengeli';
  }

  private generateReflection(content: string, emotions: string[]): string {
    if (emotions.includes('lonely')) {
      return 'Bugün sessizlik içinde kalmak seni hem yormuş hem düşündürmüş olabilir.';
    }
    if (emotions.includes('happy')) {
      return 'Bugün yaşadığın güzel anların sende pozitif bir etki bıraktığı görülüyor.';
    }
    if (emotions.includes('anxious')) {
      return 'Zihnindeki endişelerin seni meşgul ettiği ve biraz gerginlik hissettiğin anlaşılıyor.';
    }
    return 'Bugün yazdıkların inner dünyandan güzel ipuçları veriyor.';
  }

  private generateResponse(content: string, emotions: string[], userProfile?: UserProfile): string {
    const mode = userProfile?.mode || 'friend';
    
    if (emotions.includes('lonely')) {
      switch (mode) {
        case 'therapy':
          return 'Yalnızlık hissetmek insan doğasının bir parçası. Bu duyguyla baş başa kalmak bazen öz farkındalığımızı artırabilir.';
        case 'mentor':
          return 'Yalnızlık anları aslında kendimizle en derin diyaloğu kurduğumuz zamanlardır. Bu fırsatı değerlendirebilirsin.';
        case 'humorous':
          return 'Yalnızlık bazen en iyi arkadaşımız olabilir - en azından sürekli konuşmuyor! 😄';
        default:
          return 'Seni anlıyorum. Bazen kendi içimize dönmek iyi gelir ama fazla kalınca can sıkıcı hale de gelebilir.';
      }
    }
    
    if (emotions.includes('happy')) {
      return 'Bu pozitif enerjinin devam etmesi için bugün seni mutlu eden şeyleri not etmek güzel olabilir.';
    }
    
    if (emotions.includes('anxious')) {
      return 'Endişelerin normal ama onların seni kontrol etmesine izin vermemen önemli. Nefes almayı unutma.';
    }
    
    return 'Düşüncelerini paylaştığın için teşekkürler. Her not bir adım, her adım bir gelişim.';
  }

  private generateQuestion(emotions: string[]): string {
    if (emotions.includes('lonely')) {
      return 'Bu sessizlik sana ne düşündürdü? Belki de yalnızlık değil, sadece "dinlenmeye" ihtiyacındaydın?';
    }
    if (emotions.includes('happy')) {
      return 'Bu güzel hissi yaratan şey neydi? Bunu tekrar yaşamak için neler yapabilirsin?';
    }
    if (emotions.includes('anxious')) {
      return 'Bu endişelerin gerçekten kontrol edebileceğin şeyler mi? Hangileriyle başa çıkabilirsin?';
    }
    return 'Bu duygular sana neyi öğretmeye çalışıyor olabilir?';
  }

  private generateCounterNote(emotions: string[]): string | undefined {
    if (emotions.includes('sad') || emotions.includes('lonely')) {
      return 'Belki de bu hüzün geçici bir fase. Yarın bambaşka hissedebilirsin.';
    }
    if (emotions.includes('anxious')) {
      return 'Endişelerin çoğu hiç başımıza gelmeyecek şeyler. Şimdiki ana odaklanmaya ne dersin?';
    }
    return undefined;
  }

  private generateSuggestion(emotions: string[]): string {
    if (emotions.includes('lonely')) {
      return 'Belki kısa bir yürüyüş bile zihnini tazelerdi. Yarın için küçük bir dış dünya hedefi belirlemek ister misin?';
    }
    if (emotions.includes('anxious')) {
      return '5-4-3-2-1 tekniği dene: 5 şey gör, 4 şey duy, 3 şey hisset, 2 şey kokla, 1 şey tat.';
    }
    if (emotions.includes('happy')) {
      return 'Bu pozitif hissi bir günlük tutarak kaydetmek, ileride zor günlerde sana güç verebilir.';
    }
    return 'Kendine karşı sabırlı ol. Her duygu geçicidir ve sana bir şeyler öğretmeye çalışır.';
  }

  private generateMotivation(): string {
    const motivations = [
      "İç dünyanda sessizlik varsa, bazen en net ses oradadır.",
      "Her not bir tohum, her tohum yeni bir başlangıç.",
      "Duygularını anlamak, kendini anlamanın ilk adımı.",
      "Bugün zordu ama yarın yeni bir sayfa.",
      "Kendi hikayeni yazıyorsun, her kelime değerli.",
      "İçindeki ses en önemli danışmanın.",
      "Hissettiklerin seni tanımlıyor, ama sınırlamıyor."
    ];
    
    return motivations[Math.floor(Math.random() * motivations.length)];
  }

  async expandNote(originalNote: string, analysis: AIAnalysis): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Sen InnerVoice günlük asistanısın. Kullanıcının kısa notunu detaylandırıp, duygusal analiz ile birlikte kapsamlı bir günlük girişi oluştur.

ORİJİNAL NOT: "${originalNote}"

DUYGUSAL ANALİZ:
- Ton: ${analysis.emotionalTone}
- Duygular: ${analysis.mainEmotions.join(', ')}
- Ruh Hali Skoru: ${analysis.moodScore}/5

Lütfen aşağıdaki format ile detaylı bir günlük girişi oluştur:

## 📝 Bugünkü Notum
${originalNote}

## 🧠 Duygusal Analiz
**Duygusal Ton:** ${analysis.emotionalTone}
**Ana Duygular:** ${analysis.mainEmotions.join(', ')}
**Ruh Hali:** ${this.getMoodEmoji(analysis.moodScore)} (${analysis.moodScore}/5)

## 💭 İçsel Diyalog
${analysis.response}

## 🔍 Yansıtma
${analysis.reflection}

${analysis.question ? `## ❓ Düşünülesi\n${analysis.question}\n\n` : ''}${analysis.counterNote ? `## 💡 Alternatif Bakış\n${analysis.counterNote}\n\n` : ''}${analysis.suggestion ? `## 💎 Öneri\n${analysis.suggestion}\n\n` : ''}## ✨ Günün Motivasyonu
"${analysis.motivation}"

---
*Bu analiz InnerVoice AI tarafından oluşturulmuştur.*

Bu formatı kullan ve içeriği daha da zenginleştir. Samimi ve destekleyici bir ton kullan.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error in expandNote:', error);
      // Fallback expansion
      return this.createFallbackExpansion(originalNote, analysis);
    }
  }

  private createFallbackExpansion(originalNote: string, analysis: AIAnalysis): string {
    return `
## 📝 Bugünkü Notum
${originalNote}

## 🧠 Duygusal Analiz
**Duygusal Ton:** ${analysis.emotionalTone}
**Ana Duygular:** ${analysis.mainEmotions.join(', ')}
**Ruh Hali:** ${this.getMoodEmoji(analysis.moodScore)} (${analysis.moodScore}/5)

## 💭 İçsel Diyalog
${analysis.response}

## 🔍 Yansıtma
${analysis.reflection}

${analysis.question ? `## ❓ Düşünülesi\n${analysis.question}\n\n` : ''}${analysis.counterNote ? `## 💡 Alternatif Bakış\n${analysis.counterNote}\n\n` : ''}${analysis.suggestion ? `## 💎 Öneri\n${analysis.suggestion}\n\n` : ''}## ✨ Günün Motivasyonu
"${analysis.motivation}"

---
*Bu analiz InnerVoice AI tarafından oluşturulmuştur.*
`.trim();
  }
}
