import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify',
  standalone: true,
})
export class LinkifyPipe implements PipeTransform {
  private readonly urlRegex = /(^|[\s([{])((?:https?:\/\/|www\.)[^\s<>"']+)/gi;

  transform(
    value: string | null | undefined,
    preserveHtml: boolean = false
  ): string {
    if (!value) return '';

    return preserveHtml ? this.linkifyHtml(value) : this.linkifyPlainText(value);
  }

  private linkifyHtml(content: string): string {
    return content
      .split(/(<a\b[\s\S]*?<\/a>|<[^>]+>)/gi)
      .map((part) => (part.startsWith('<') ? part : this.linkifyText(part)))
      .join('');
  }

  private linkifyPlainText(text: string): string {
    let result = '';
    let lastIndex = 0;
    this.urlRegex.lastIndex = 0;

    text.replace(this.urlRegex, (match, prefix, rawUrl, offset) => {
      const urlStart = offset + prefix.length;
      const urlEnd = urlStart + rawUrl.length;

      result += this.escapeHtml(text.slice(lastIndex, urlStart));
      result += this.buildAnchor(rawUrl, true);
      lastIndex = urlEnd;

      return match;
    });

    result += this.escapeHtml(text.slice(lastIndex));
    return result;
  }

  private linkifyText(text: string): string {
    this.urlRegex.lastIndex = 0;

    return text.replace(this.urlRegex, (match, prefix, rawUrl) => {
      return `${prefix}${this.buildAnchor(rawUrl, false)}`;
    });
  }

  private buildAnchor(rawUrl: string, escapeText: boolean): string {
    const trailing = rawUrl.match(/[.,!?;:)\]}]+$/)?.[0] ?? '';
    const url = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;

    if (!url.includes('.')) {
      return escapeText ? this.escapeHtml(rawUrl) : rawUrl;
    }

    const href = url.toLowerCase().startsWith('www.') ? `https://${url}` : url;
    const text = escapeText ? this.escapeHtml(url) : url;

    return `<a href="${this.escapeAttribute(
      href
    )}" target="_blank" rel="noopener noreferrer">${text}</a>${trailing}`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return value.replace(/"/g, '&quot;');
  }
}
