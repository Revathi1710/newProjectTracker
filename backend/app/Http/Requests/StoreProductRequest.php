<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add admin auth check here if needed
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'code'           => ['required', 'string', 'max:100', 'unique:products,code'],
            'slug'           => ['required', 'string', 'max:255', 'unique:products,slug'],
            'published_in'   => ['required', 'string', 'max:255'],
            'format'         => ['nullable', 'string', 'max:100'],
            'total_projects' => ['nullable', 'integer', 'min:0'],
            'description'    => ['nullable', 'string'],
            'highlights'     => ['nullable', 'string'],
            'status'         => ['required', 'in:active,inactive'],
            'price'          => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'quantity'       => ['required', 'integer', 'min:0'],

            // Images array — each must be a valid image file
            'images'         => ['nullable', 'array', 'max:10'],
            'images.*'       => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // 10 MB each
        ];
    }

    /**
     * Custom human-readable attribute names.
     */
    public function attributes(): array
    {
        return [
            'name'           => 'Product Name',
            'code'           => 'Product Code',
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
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'code.unique'       => 'This product code is already in use. Please choose a different one.',
            'price.min'         => 'Price cannot be negative.',
            'quantity.min'      => 'Quantity cannot be negative.',
            'images.*.image'    => 'Each uploaded file must be a valid image.',
            'images.*.max'      => 'Each image must not exceed 10 MB.',
        ];
    }
}