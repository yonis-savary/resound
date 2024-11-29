<?php

namespace Resound\Commands;

use YonisSavary\Sharp\Classes\CLI\Args;
use YonisSavary\Sharp\Classes\CLI\Command;
use Resound\Controllers\TagController;
use YonisSavary\Sharp\Classes\CLI\AbstractCommand;
use YonisSavary\Sharp\Classes\Data\ObjectArray;

class ExtractAllTags extends AbstractCommand
{
    public function execute(Args $args): int
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

        return 0;
    }
}