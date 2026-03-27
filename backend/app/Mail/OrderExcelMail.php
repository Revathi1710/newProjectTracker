<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class OrderExcelMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $downloadLinks = [];

    public function __construct(public Order $order)
    {
        $this->order->loadMissing('items.product');

        foreach ($this->order->items as $item) {
            $product = $item->product;

            if (! $product || ! $product->excel_path) {
                Log::info('OrderExcelMail: skipping item, no product/excel_path', [
                    'item_id' => $item->id,
                ]);
                continue;
            }

            $signedUrl = URL::temporarySignedRoute(
                'order.download.excel',
                now()->addDays(7),
                [
                    'order'   => $this->order->id,
                    'product' => $product->id,
                ]
            );

            $this->downloadLinks[] = [
                'name' => $product->name,
                'url'  => $signedUrl,
            ];

            Log::info('OrderExcelMail: generated signed download link', [
                'product_id' => $product->id,
            ]);
        }

        if (empty($this->downloadLinks)) {
            Log::warning('OrderExcelMail: no download links generated', [
                'order_id' => $this->order->id,
            ]);
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your NPTStore Order #' . $this->order->id . ' — Reports Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-excel',
            with: [
                'order'         => $this->order,
                'downloadLinks' => $this->downloadLinks,
            ],
        );
    }

    // No attachments() — we send links instead
}