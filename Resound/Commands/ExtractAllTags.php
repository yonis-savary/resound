<?php

namespace Resound\Commands;

use Sharp\Classes\CLI\Args;
use Sharp\Classes\CLI\Command;
use Resound\Controllers\TagController;
use Sharp\Classes\Data\ObjectArray;

class ExtractAllTags extends Command
{
    public function __invoke(Args $args)
    {
        set_time_limit(600);

        $storage = TagController::getQueueStorage();

        do
        {
            TagController::processQueue();

            $remains = ObjectArray::fromArray($storage->listFiles())
            ->filter(fn($x) => !str_starts_with($x, "#~"))
            ->collect();
        }
        while (count($remains));
    }
}