<?php

namespace Resound\Commands;

use Sharp\Classes\CLI\Args;
use Sharp\Classes\CLI\Command;
use Resound\Controllers\TagController;

class ExtractAllTags extends Command
{
    public function __invoke(Args $args)
    {
        set_time_limit(600);

        $storage = TagController::getQueueStorage();

        while (!$storage->isEmpty())
          TagController::processQueue();
    }
}