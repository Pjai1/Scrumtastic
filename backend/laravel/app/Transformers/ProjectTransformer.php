<?php

namespace App\Transformers;

use League\Fractal\TransformerAbstract;
use App\Project;

class ProjectTransformer extends TransformerAbstract
{
    /**
     * A Fractal transformer.
     *
     * @return array
     */
    public function transform(Project $project)
    {
        return [
            'identifier' => (int)$project->id,
            'name' => (string)$project->name,
            'description' => (string)$project->description,
            'creationDate' => (string)$project->created_at,
            'lastChange' => (string)$project->updated_at,
            'deletedDate' => isset($project->deleted_at) ? (string)$project->deleted_at : null
        ];
    }
}
