import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import AdminPage from '@/components/admin/AdminPage';
import ImageUrlFields from '@/components/admin/ImageUrlFields';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Choice';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import {
  archiveAdminProduct,
  createAdminProduct,
  getAdminProduct,
  isHttpUrl,
  listAdminCategories,
  updateAdminProduct,
} from '@/lib/admin';
import { mapApiFieldErrors } from '@/lib/formErrors';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

function emptyImageRow() {
  return { url: '', alt: '', isPrimary: false };
}

function emptySpec() {
  return { key: '', value: '' };
}

function formFromProduct(product) {
  const images = product?.images?.length
    ? product.images.map((image) => ({
        url: image.url ?? '',
        alt: image.alt ?? '',
        isPrimary: Boolean(image.isPrimary),
      }))
    : [emptyImageRow()];

  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    category: product?.category?._id ?? product?.category ?? '',
    description: product?.description ?? '',
    shortDescription: product?.shortDescription ?? '',
    brand: product?.brand ?? '',
    price: product?.price ?? '',
    salePrice: product?.salePrice ?? '',
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    status: product?.status ?? 'draft',
    isFeatured: Boolean(product?.isFeatured),
    images,
    specifications: product?.specifications?.length ? product.specifications : [emptySpec()],
  };
}

function parseOptionalNumber(value) {
  if (value === '' || value == null) return null;
  return Number(value);
}

function clientErrors(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.sku.trim()) errors.sku = 'SKU is required';
  if (!form.category) errors.category = 'Category is required';

  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a positive price';

  const salePrice = parseOptionalNumber(form.salePrice);
  if (form.salePrice !== '' && form.salePrice != null) {
    if (!Number.isFinite(salePrice) || salePrice < 0) errors.salePrice = 'Enter a valid sale price';
    else if (Number.isFinite(price) && salePrice >= price) {
      errors.salePrice = 'Sale price cannot exceed the regular price';
    }
  }

  const stock = Number(form.stock);
  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock cannot be negative';

  form.images.forEach((image, index) => {
    const url = image.url.trim();
    if (url && !isHttpUrl(url)) errors[`images.${index}.url`] = 'Enter a valid http(s) URL';
  });

  return errors;
}

function toPayload(form) {
  const images = form.images
    .filter((image) => image.url.trim())
    .map((image, index) => ({
      url: image.url.trim(),
      alt: image.alt.trim(),
      isPrimary: Boolean(image.isPrimary) || index === 0,
    }));

  const payload = {
    name: form.name.trim(),
    sku: form.sku.trim(),
    category: form.category,
    description: form.description.trim(),
    shortDescription: form.shortDescription.trim(),
    brand: form.brand.trim(),
    specifications: form.specifications
      .filter((row) => row.key.trim() && row.value.trim())
      .map((row) => ({ key: row.key.trim(), value: row.value.trim() })),
    images,
    price: Number(form.price),
    salePrice: form.salePrice === '' || form.salePrice == null ? null : Number(form.salePrice),
    stock: Number(form.stock),
    lowStockThreshold: Number(form.lowStockThreshold) || 0,
    status: form.status,
    isFeatured: Boolean(form.isFeatured),
  };

  if (form.slug.trim()) payload.slug = form.slug.trim();
  return payload;
}

export function ProductEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { notify } = useToast();

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useAsyncData(
    listAdminCategories,
    [],
  );
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
    reload,
  } = useAsyncData(() => (isNew ? Promise.resolve(null) : getAdminProduct(id)), [id, isNew]);

  const initial = useMemo(() => formFromProduct(product), [product]);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const current = form ?? initial;
  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...(prev ?? initial), [field]: value }));
  };

  const isLoading = categoriesLoading || (!isNew && productLoading);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = clientErrors(current);
    setFieldErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(current);
      if (isNew) {
        const created = await createAdminProduct(payload);
        notify('Product created');
        navigate(`/admin/products/${created._id}`, { replace: true });
      } else {
        await updateAdminProduct(id, payload);
        notify('Product saved');
        setForm(null);
        reload();
      }
    } catch (err) {
      setFieldErrors(mapApiFieldErrors(err));
      setFormError(err.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!window.confirm('Archive this product? It will no longer be purchasable on the storefront.')) return;
    setArchiving(true);
    try {
      await archiveAdminProduct(id);
      notify('Product archived');
      navigate('/admin/products');
    } catch (err) {
      setFormError(err.message || 'Could not archive product.');
    } finally {
      setArchiving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPage title={isNew ? 'Add product' : 'Edit product'}>
        <Skeleton className="h-64 w-full rounded-card" />
        <span className="sr-only">Loading product form</span>
      </AdminPage>
    );
  }

  if (categoriesError || productError) {
    return (
      <AdminPage title={isNew ? 'Add product' : 'Edit product'}>
        <Alert variant="danger" title="Could not load this form">
          {(categoriesError || productError).message || 'Please try again.'}
        </Alert>
      </AdminPage>
    );
  }

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...(categories ?? []).map((category) => ({
      value: category._id,
      label: `${category.name}${category.status === 'inactive' ? ' (inactive)' : ''}`,
    })),
  ];

  return (
    <AdminPage
      title={isNew ? 'Add product' : 'Edit product'}
      description="Prices, stock and status are validated on the server. Empty image URLs use the storefront placeholder."
      actions={
        <Button to="/admin/products" variant="outline">
          Back to products
        </Button>
      }
    >
      {formError && (
        <Alert variant="danger" title="Could not save" className="mb-6">
          {formError}
        </Alert>
      )}

      <form className="grid max-w-4xl gap-8" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product name"
            required
            value={current.name}
            onChange={set('name')}
            error={fieldErrors.name}
          />
          <Input
            label="SKU"
            required
            value={current.sku}
            onChange={set('sku')}
            error={fieldErrors.sku}
            hint="Must be unique"
          />
          <Select
            label="Category"
            required
            value={current.category}
            onChange={set('category')}
            options={categoryOptions}
            error={fieldErrors.category}
          />
          <Input
            label="Slug"
            value={current.slug}
            onChange={set('slug')}
            error={fieldErrors.slug}
            hint="Leave blank to generate from the name"
          />
          <Input label="Brand" value={current.brand} onChange={set('brand')} error={fieldErrors.brand} />
          <Select
            label="Status"
            value={current.status}
            onChange={set('status')}
            options={STATUS_OPTIONS}
            error={fieldErrors.status}
          />
        </div>

        <Textarea
          label="Description"
          rows={6}
          value={current.description}
          onChange={set('description')}
          error={fieldErrors.description}
        />
        <Textarea
          label="Short description"
          rows={3}
          value={current.shortDescription}
          onChange={set('shortDescription')}
          error={fieldErrors.shortDescription}
        />

        <fieldset className="space-y-3">
          <legend className="text-ink-700 text-sm font-medium">Specifications</legend>
          {current.specifications.map((row, index) => (
            <div key={`spec-${index}`} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Input
                label="Label"
                srOnlyLabel={index > 0}
                value={row.key}
                onChange={(event) => {
                  const specifications = current.specifications.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, key: event.target.value } : item,
                  );
                  setForm({ ...current, specifications });
                }}
              />
              <Input
                label="Value"
                srOnlyLabel={index > 0}
                value={row.value}
                onChange={(event) => {
                  const specifications = current.specifications.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, value: event.target.value } : item,
                  );
                  setForm({ ...current, specifications });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                className="sm:mt-7"
                onClick={() => {
                  const specifications = current.specifications.filter((_, currentIndex) => currentIndex !== index);
                  setForm({ ...current, specifications: specifications.length ? specifications : [emptySpec()] });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setForm({ ...current, specifications: [...current.specifications, emptySpec()] })}
          >
            Add specification
          </Button>
        </fieldset>

        <ImageUrlFields
          images={current.images}
          seed={current.name || 'Product'}
          onChange={(images) => setForm({ ...current, images })}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Regular price (₹)"
            type="number"
            min="1"
            step="1"
            required
            value={current.price}
            onChange={set('price')}
            error={fieldErrors.price}
          />
          <Input
            label="Sale price (₹)"
            type="number"
            min="0"
            step="1"
            value={current.salePrice}
            onChange={set('salePrice')}
            error={fieldErrors.salePrice}
            hint="Leave empty for no sale"
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            step="1"
            required
            value={current.stock}
            onChange={set('stock')}
            error={fieldErrors.stock}
          />
          <Input
            label="Low-stock threshold"
            type="number"
            min="0"
            step="1"
            value={current.lowStockThreshold}
            onChange={set('lowStockThreshold')}
            error={fieldErrors.lowStockThreshold}
          />
        </div>

        <Checkbox
          label="Featured on the homepage"
          checked={current.isFeatured}
          onChange={set('isFeatured')}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving}>
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
          {!isNew && current.status !== 'archived' && (
            <Button type="button" variant="outline" loading={archiving} onClick={handleArchive}>
              Archive product
            </Button>
          )}
          <Button to="/admin/products" variant="ghost">
            Cancel
          </Button>
        </div>
      </form>

      {!isNew && product?.slug && (
        <p className="text-ink-400 mt-6 text-sm">
          Storefront:{' '}
          <Link to={`/product/${product.slug}`} className="underline-offset-2 hover:underline">
            /product/{product.slug}
          </Link>
          {current.status !== 'active' ? ' (not publicly listed while inactive)' : ''}
        </p>
      )}
    </AdminPage>
  );
}

export default ProductEditor;
