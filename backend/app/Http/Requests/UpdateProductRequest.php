<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // FIX #1 — extract the actual ID from the route model binding
        // $this->route('product') returns the Product model, not the raw ID
        $productId = $this->route('product')?->id ?? $this->route('product');

        return [
            'name'            => ['sometimes', 'required', 'string', 'max:255'],
            // FIX #2 — use variable interpolation correctly (was a string literal bug)
            'code'            => ['sometimes', 'required', 'string', 'max:100', "unique:products,code,{$productId}"],
            'slug'            => ['sometimes', 'required', 'string', 'max:255', "unique:products,slug,{$productId}"],
            'published_in'    => ['sometimes', 'required', 'string', 'max:255'],
            'format'          => ['nullable', 'string', 'max:100'],
            'total_projects'  => ['nullable', 'integer', 'min:0'],
            'description'     => ['nullable', 'string'],
            'highlights'      => ['nullable', 'string'],
            'status'          => ['sometimes', 'required', 'in:active,inactive'],
            'price'           => ['sometimes', 'required', 'numeric', 'min:0', 'max:9999999.99'],
            'quantity'        => ['sometimes', 'required', 'integer', 'min:0'],
            'images'          => ['nullable', 'array', 'max:10'],
            'images.*'        => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            'remove_images'   => ['nullable', 'array'],
            'remove_images.*' => ['integer', 'exists:product_images,id'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'           => 'Product Name',
            'code'           => 'Product Code',
            'slug'           => 'Slug',
            'published_in'   => 'Published In',
            'format'         => 'Format',
            'total_projects' => 'Total Projects',
            'description'    => 'Description',
            'highlights'     => 'Highlights',
            'status'         => 'Status',
            'price'          => 'Price',
            'quantity'       => 'Quantity',
            'images'         => 'Product Images',
            'images.*'       => 'Image',
            'remove_images'  => 'Images to Remove',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique'        => 'This product code is already in use. Please choose a different one.',
            'slug.unique'        => 'This slug is already in use. Please choose a different one.',
            'price.min'          => 'Price cannot be negative.',
            'quantity.min'       => 'Quantity cannot be negative.',
            'images.*.image'     => 'Each uploaded file must be a valid image.',
            'images.*.max'       => 'Each image must not exceed 10 MB.',
            'remove_images.*.exists' => 'One or more selected images do not exist.',
        ];
    }
}