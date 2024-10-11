<?php

namespace YonisSavary\Resound\Commands;

use YonisSavary\Sharp\Classes\CLI\Args;
use YonisSavary\Sharp\Classes\CLI\Command;
use YonisSavary\Resound\Controllers\TagController;
use YonisSavary\Sharp\Classes\Data\ObjectArray;

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