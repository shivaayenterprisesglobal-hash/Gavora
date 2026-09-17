import { useMemo, useState } from 'react';

import AdminPage from '@/components/admin/AdminPage';
import { AdminTable, AdminTd, AdminTh } from '@/components/admin/AdminTable';
import ImageUrlFields from '@/components/admin/ImageUrlFields';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import {
  createAdminCategory,
  deactivateAdminCategory,
  isHttpUrl,
  listAdminCategories,
  updateAdminCategory,
} from '@/lib/admin';
import { mapApiFieldErrors } from '@/lib/formErrors';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  status: 'active',
  images: [{ url: '', alt: '', isPrimary: false }],
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

function toForm(category) {
  return {
    name: category.name ?? '',
    slug: category.slug ?? '',
    description: category.description ?? '',
    status: category.status ?? 'active',
    images: [
      {
        url: category.image?.url ?? '',
        alt: category.image?.alt ?? '',
        isPrimary: true,
      },
    ],
  };
}

function toPayload(form) {
  const image = form.images[0] ?? { url: '', alt: '' };
  const url = image.url.trim();
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim(),
    status: form.status,
    image: {
      url,
      alt: image.alt.trim(),
    },
  };
}

export function Categories() {
  const { notify } = useToast();
  const { data, isLoading, error, reload } = useAsyncData(listAdminCategories, []);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');

  const filtered = useMemo(() => {
    const categories = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        category.slug.toLowerCase().includes(q) ||
        (category.description || '').toLowerCase().includes(q),
    );
  }, [data, search]);

  function startCreate() {
    setEditingId('new');
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError('');
  }

  function startEdit(category) {
    setEditingId(category._id);
    setForm(toForm(category));
    setFieldErrors({});
    setFormError('');
  }

  function cancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    const url = form.images[0]?.url?.trim() ?? '';
    if (url && !isHttpUrl(url)) errors.image = 'Enter a valid http(s) URL';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = toPayload(form);
      if (editingId === 'new') {
        await createAdminCategory(payload);
        notify('Category created');
      } else {
        await updateAdminCategory(editingId, payload);
        notify('Category saved');
      }
      cancel();
      reload();
    } catch (err) {
      setFieldErrors(mapApiFieldErrors(err));
      setFormError(err.message || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(category) {
    if (
      !window.confirm(
        `Deactivate “${category.name}”? Existing products keep this category; it will leave the public menu.`,
      )
    ) {
      return;
    }
    setBusyId(category._id);
    try {
      await deactivateAdminCategory(category._id);
      notify('Category deactivated');
      if (editingId === category._id) cancel();
      reload();
    } catch (err) {
      notify(err.message || 'Could not deactivate category.', { tone: 'danger' });
    } finally {
      setBusyId('');
    }
  }

  return (
    <AdminPage
      title="Categories"
      description="Categories are deactivated rather than deleted, so products that already reference them keep their history."
      actions={<Button onClick={startCreate}>Add category</Button>}
    >
      <Input
        label="Search categories"
        srOnlyLabel
        placeholder="Search by name or slug"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {editingId && (
        <form
          onSubmit={handleSubmit}
          className="border-ink-100 mt-6 rounded-card grid max-w-3xl gap-4 border bg-canvas-raised p-5"
          noValidate
        >
          <h2 className="font-sans text-base font-semibold">
            {editingId === 'new' ? 'New category' : 'Edit category'}
          </h2>
          {formError && (
            <Alert variant="danger" title="Could not save">
              {formError}
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              error={fieldErrors.name}
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              error={fieldErrors.slug}
              hint="Leave blank to generate from the name"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              options={STATUS_OPTIONS}
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            error={fieldErrors.description}
          />
          <ImageUrlFields
            images={form.images}
            seed={form.name || 'Category'}
            max={1}
            onChange={(images) => setForm((current) => ({ ...current, images: images.slice(0, 1) }))}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {editingId === 'new' ? 'Create category' : 'Save category'}
            </Button>
            <Button type="button" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="mt-8 space-y-3" aria-busy="true">
          <Skeleton className="h-16 w-full rounded-card" />
          <span className="sr-only">Loading categories</span>
        </div>
      )}

      {error && (
        <Alert variant="danger" title="Could not load categories" className="mt-8">
          {error.message || 'Please try again.'}{' '}
          <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
            Retry
          </button>
        </Alert>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="grid"
          title="No categories"
          description={search ? 'No categories match that search.' : 'Create a category to organise the catalogue.'}
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <>
          <ul className="mt-8 space-y-3 md:hidden">
            {filtered.map((category) => (
              <li key={category._id} className="rounded-card border-ink-100 bg-canvas-raised border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-ink-400 text-xs">{category.slug}</p>
                    <p className="text-ink-500 mt-1 text-sm">{category.productCount} products</p>
                  </div>
                  <Badge variant={category.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {category.status}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(category)}>
                    Edit
                  </Button>
                  {category.status !== 'inactive' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      loading={busyId === category._id}
                      onClick={() => handleDeactivate(category)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden md:block">
            <AdminTable>
              <thead className="border-ink-100 border-b">
                <tr>
                  <AdminTh>Name</AdminTh>
                  <AdminTh>Slug</AdminTh>
                  <AdminTh>Products</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>
                    <span className="sr-only">Actions</span>
                  </AdminTh>
                </tr>
              </thead>
              <tbody className="divide-ink-100 divide-y">
                {filtered.map((category) => (
                  <tr key={category._id} className="hover:bg-ink-50/70">
                    <AdminTd className="font-medium">{category.name}</AdminTd>
                    <AdminTd className="text-ink-500 font-mono text-xs">{category.slug}</AdminTd>
                    <AdminTd>{category.productCount}</AdminTd>
                    <AdminTd>
                      <Badge variant={category.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {category.status}
                      </Badge>
                    </AdminTd>
                    <AdminTd>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => startEdit(category)}>
                          Edit
                        </Button>
                        {category.status !== 'inactive' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            loading={busyId === category._id}
                            onClick={() => handleDeactivate(category)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        </>
      )}
    </AdminPage>
  );
}

export default Categories;
