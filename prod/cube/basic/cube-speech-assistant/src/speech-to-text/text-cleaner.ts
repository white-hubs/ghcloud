const ASR_TEXT_TAG_PATTERN = /<\/?asr_text>/gi;
const LANGUAGE_PREFIX_PATTERN = /^\s*language\s*(?:[:+]\s*)?[^\s<]+\s*/i;

export class SpeechTranscribedTextCleaner {
  public static sanitize(text: string): string {
    if (!text) {
      return text;
    }
    return text.replace(LANGUAGE_PREFIX_PATTERN, "").replace(ASR_TEXT_TAG_PATTERN, "").trimStart();
  }
}
