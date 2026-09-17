import Button from '@/components/ui/Button';
import ImageFrame from '@/components/ui/ImageFrame';
import Input from '@/components/ui/Input';
import { isHttpUrl } from '@/lib/admin';

function emptyImageRow() {
  return { url: '', alt: '', isPrimary: false };
}

export function ImageUrlFields({ images, onChange, seed = 'Gavora', max = 12 }) {
  function update(index, patch) {
    onChange(images.map((image, current) => (current === index ? { ...image, ...patch } : image)));
  }

  function setPrimary(index) {
    onChange(images.map((image, current) => ({ ...image, isPrimary: current === index })));
  }

  function addRow() {
    onChange([...images, emptyImageRow()]);
  }

  function removeRow(index) {
    const next = images.filter((_, current) => current !== index);
    onChange(next.length > 0 ? next : [emptyImageRow()]);
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-ink-700 text-sm font-medium">Images</legend>
      <p className="text-ink-400 text-xs">
        Paste https image URLs. Broken or empty URLs fall back to a brand placeholder. File upload
        can be added later without changing this layout.
      </p>

      <ul className="space-y-4">
        {images.map((image, index) => {
          const url = image.url.trim();
          const valid = url === '' || isHttpUrl(url);
          return (
            <li
              key={`image-${index}`}
              className="border-ink-100 rounded-card grid gap-4 border p-3 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
            >
              <ImageFrame
                src={valid && url ? url : ''}
                alt={image.alt || ''}
                seed={image.alt || seed}
                ratio="square"
                className="rounded-control size-24 sm:size-auto"
              />
              <div className="grid gap-3">
                <Input
                  label={`Image ${index + 1} URL`}
                  value={image.url}
                  onChange={(event) => update(index, { url: event.target.value })}
                  placeholder="https://"
                  error={url && !valid ? 'Enter a valid http(s) URL' : undefined}
                />
                <Input
                  label="Alt text"
                  value={image.alt}
                  onChange={(event) => update(index, { alt: event.target.value })}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-ink-600 flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="primary-image"
                      checked={Boolean(image.isPrimary)}
                      onChange={() => setPrimary(index)}
                    />
                    Primary image
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {images.length < max && (
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          Add image URL
        </Button>
      )}
    </fieldset>
  );
}

export default ImageUrlFields;
